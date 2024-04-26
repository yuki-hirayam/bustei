import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, getMetadata, uploadBytes, deleteObject, list} from "firebase/storage";
import { collection,doc,getDoc,getDocs,getFirestore, onSnapshot,addDoc,serverTimestamp,updateDoc,deleteDoc } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyAnut_51TS01KzQ761dx357JhMBNqUbZxs",
	authDomain: "web-kikaku-b4caf.firebaseapp.com",
	projectId: "web-kikaku-b4caf",
	storageBucket: "web-kikaku-b4caf.appspot.com",
	messagingSenderId: "986153949778",
	appId: "1:986153949778:web:4dd927b7e2fdbb9ae29d8b",
	measurementId: "G-B0N6NWKM53"
};

    
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

let timelist = {};
let timelist2 = {};
let lastHourChecked = null;

const hon = {name: "hon", text: "H:本館", lat: 35.073062269977676, lng: 135.77091220708303, min: 0};
const kyu = {name: "kyu", text: "Q:究明館", lat: 35.07480374881795, lng: 135.77369434573774, min: 4};
const fuu = {name: "fuu", text: "F:風光館", lat: 35.074246312567716, lng: 135.77358244811793, min: 3};
const ait = {name: "ait", text: "A:愛智館", lat: 35.073948806873794, lng: 135.77351275835073, min: 2.5};
const gog = {name: "gog", text: "5:５号館", lat: 35.074083779806664, lng: 135.7720063347692, min: 2};
const nan = {name: "nan", text: "7:７号館", lat: 35.07400208129829, lng: 135.77256385289996, min: 2};
const syu = {name: "syu", text: "S:春秋館", lat: 35.07356003705856, lng: 135.77251544398308, min: 2};
const jiz = {name: "jiz", text: "Z:自在館", lat: 35.0737019405385, lng: 135.77191938612611, min: 2};
const kou = {name: "kou", text: "K:光彩館", lat: 35.07389692184575, lng: 135.77150894627286, min: 2};
const taih = {name: "taih", text: "T:対峰館", lat: 35.073360334213355, lng: 135.77161680351836, min: 1};
const kei = {name: "kei", text: "R:流渓館", lat: 35.07346149530802, lng: 135.77073649859213, min: 1};
const yuy = {name: "yuy", text: "U:悠々館", lat: 35.07339292899199, lng: 135.76993997726123, min: 1};
const mei = {name: "mei", text: "M:明窓館", lat: 35.07284318878284, lng: 135.77033835496653, min: 0};
const sei = {name: "sei", text: "C:清風館", lat: 35.07253135261089, lng: 135.77017123553932, min: 1};
const rei = {name: "rei", text: "L:黎明館", lat: 35.07283288370092, lng: 135.76989463108825, min: 1.5};
const jou = {name: "jou", text: "J:情報館", lat: 35.07331017117355, lng: 135.76933573011036, min: 1.5};
const yua = {name: "yua", text: "Y:友愛館", lat: 35.073447733570376, lng: 135.7691025249175, min: 2};
const enn = {name: "enn", text: "E:遠友館", lat: 35.07378750628888, lng: 135.76906053319934, min: 2.5};
const taii = {name: "taii", text: "G:体育館", lat: 35.07384002959979, lng: 135.76852433946988, min: 3};

const building = [hon,kyu,fuu,ait,gog,nan,syu,jiz,kou,taih,kei,yuy,mei,sei,rei,jou,yua,enn,taii]
let bustime;

import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

const swiper = new Swiper(".swiper", {
	// ナビボタンが必要なら追加
	navigation: {
	  nextEl: ".swiper-button-next",
	  prevEl: ".swiper-button-prev"
	}
    });

const R = Math.PI / 180;
function distance(lat1, lng1, lat2, lng2) {
  lat1 *= R;
  lng1 *= R;
  lat2 *= R;
  lng2 *= R;
  return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
}

document.getElementById('submit-button').addEventListener('click', async function() {
	const selectedBuilding = document.querySelector('.building-option.selected');
	const after = document.getElementById('maniauafter');
	const before = document.getElementById('maniaubefore');
	const selb = document.getElementById('selectbuild');
	if (this.textContent === "選択"){
		if (selectedBuilding) {
			const buildingname = selectedBuilding.getAttribute('data-building');
			const buildingdata = building.find(build => build.name === buildingname);
			selb.classList.remove('hidden');
			after.classList.remove('hidden');
			before.classList.add('hidden');
			this.textContent = "建物を選び直す";
			selb.innerHTML = '';
			try{
				let img = document.createElement('img');
				const fileRef = ref(storage, "building/"+buildingdata.name+".jpg")
				img.src =  await getDownloadURL(fileRef);
				img.alt = buildingdata.text;
				img.width = 96;
				img.height = 72;
				selb.appendChild(img);
			}catch(error){
				console.error("Error loading image: ", error);
			}
			let h3 = document.createElement('h3');
			h3.textContent = buildingdata.text;
			selb.appendChild(h3);
			document.getElementById('requiredtime').textContent ="徒歩約" + buildingdata.min + "分";
			if (bustime < buildingdata.min){
				document.getElementById('maniautext').innerText = "次のバス";
			}else if (bustime == buildingdata.min){
				document.getElementById('maniautext').innerText = "急げば間に合う";
			}else if (bustime > buildingdata.min){
				document.getElementById('maniautext').innerText = "間に合う";
			}
			return;
		} else {
			alert('建物を選択してください。');
		}
	} else if (this.textContent === "建物を選び直す"){
		buildmain();
		selb.classList.add('hidden');
		after.classList.add('hidden');
		before.classList.remove('hidden');
		selb.innerHTML = '';
		document.getElementById('requiredtime').innerHTML = '';
		document.getElementById('maniautext').innerHTML = '';
		this.textContent = "選択";
		return;
	}
});

function buildmain() {
	navigator.geolocation.getCurrentPosition(async (position) => {
	  let bpos = building.map(build => {
	    let dis = distance(build.lat, build.lng, position.coords.latitude, position.coords.longitude);
	    return {...build, dis};
	  });
    
	  bpos.sort((a, b) => a.dis - b.dis);
    
	  // 画像のURLを取得する非同期関数をPromise.allに渡す
	  const imgPromises = bpos.map(build => getDownloadURL(ref(storage, "building/" + build.name + ".jpg")));
    
	  try {
	    // すべての画像のURL取得が完了するのを待つ
	    const imgURLs = await Promise.all(imgPromises);

	    document.getElementById('buildlist').innerHTML = '';
	    // DOMにボタンを追加
	    bpos.forEach((build, index) => {
		let button = document.createElement('button');
		let img = document.createElement('img');
		img.src = imgURLs[index];
		img.alt = build.text;
		img.width = 80;
		img.height = 60;
		button.appendChild(img);
		button.classList.add('building-option');
		button.setAttribute('data-building', build.name);
    
		let h3 = document.createElement('h3');
		h3.textContent = build.text;
		button.appendChild(h3);
		button.addEventListener('click', function() {
		  document.querySelectorAll('.building-option').forEach(btn => btn.classList.remove('selected'));
		  this.classList.add('selected');
		});
    
		document.getElementById('buildlist').appendChild(button);
	    });
    
	    // ここで他の処理を実行
	  } catch (error) {
	    console.error("Error loading images: ", error);
	  }
	});
    }

// busmain();
buildmain();

function getbusRef(hour){
	if (hour >= 8 && hour < 14) {
		return doc(db, "bustime", "8-13");
	  } else if (hour >= 14 && hour < 17) {
		return doc(db, "bustime", "14-16");
	  } else if (hour >= 17 && hour < 20) {
		return doc(db, "bustime", "17-19");
	  } else if (hour === 20) {
		return doc(db, "bustime", "20");
	  } else if (hour === 21) {
		return doc(db, "bustime", "21");
	  }
	  return null;
}
async function getbustime(){
	let date = new Date();
	let hour = date.getHours();
	if (hour !== lastHourChecked) {
		lastHourChecked = hour;
		let nhour = hour + 1;
		let docRef = getbusRef(hour);
		let ndocRef = getbusRef(nhour);
    
		try {
			let doc = await getDoc(docRef);
		    	timelist = doc.data();
		    	console.log(timelist);
	
			doc = await getDoc(ndocRef);
			timelist2 = doc.data();
			console.log(timelist2);
		} catch (error) {
			console.log("Error getting document:", error);
		}
	  }
}
function updateBusTime(bustime, nbusitime, min){
	let bustime_text = document.getElementById("busitsu");
	bustime_text.innerHTML = "約"+bustime+"分後";
	let nbustime = nbusitime-min;
	if (nbusitime < bustime) {
		nbustime += 60;
	}
	let nbustime_text = document.getElementById("nbusitsu");
	nbustime_text.innerHTML = "約"+nbustime+"分後";
}
function busmain(){
	let date = new Date();
	let hour = date.getHours();
	let min = date.getMinutes();

	if (Object.keys(timelist).length == 0){
		if (hour <9){
			let bustime_text = document.getElementById("busitsu");
			bustime_text.innerHTML = "始発は9:00です";
		} else if (9 <= hour && hour <= 20){
			getbustime();
		} else if (hour > 22){
			let bustime_text = document.getElementById("busitsu");
			bustime_text.innerHTML = "今日のバスは終了しました";
		}
	} else {
		getbustime();
		for (let i=1; i <= Object.keys(timelist).length; i++){
			let time = timelist[i];
			let nexttime = timelist[i+1] !== undefined?timelist[i+1]:timelist2[1];

			if (min < time){
				bustime = time-min;
				updateBusTime(bustime, nexttime, min);
				break;
			} else if (min == time){
				let bustime_text = document.getElementById("busitsu");
				bustime_text.innerHTML = "バスが来ました";
				let nbustime = nexttime-min;
				if (nbustime < bustime) {
					nbustime += 60;
				}
			} else if (min > time && i == Object.keys(timelist).length){
				let bustime_text = document.getElementById("busitsu");
				let nbustime_text = document.getElementById("nbusitsu");
				if (Object.keys(timelist2).length === 0){
					if(hour < 9){
						bustime_text.innerHTML = "始発は9:00です";
						nbustime_text.innerHTML = "";
					} else if (hour >= 21){
						bustime_text.innerHTML = "今日のバスは終了しました";
						nbustime_text.innerHTML = "";
					} else {
						bustime_text.innerHTML = "次のバスのデータがありません";
						nbustime_text.innerHTML = "";
					}
				}
			}
		}
	}
}
setInterval(busmain,10000);

