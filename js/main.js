const header=document.getElementById('header');
const menuToggle=document.getElementById('menuToggle');
const nav=document.getElementById('nav');
const hero=document.getElementById('heroVisual');

window.addEventListener('scroll',()=>{
	header.classList.toggle('scrolled',window.scrollY>20);
	const sections=[...document.querySelectorAll('main section[id]')];
	const links=[...document.querySelectorAll('.nav a')];
	let current='overview';
	sections.forEach(s=>{if(window.scrollY>=s.offsetTop-140) current=s.id});
	links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
	const timeline=document.getElementById('timeline');
	if(timeline){
		const r=timeline.getBoundingClientRect(), vh=innerHeight;
		const p=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height*.45)));
		const line=timeline.querySelector('.timeline-progress');
		if(line) line.style.height=(20+p*75)+'%';
	}
},{passive:true});

menuToggle.addEventListener('click',()=>{
	const open=nav.classList.toggle('open');
	menuToggle.setAttribute('aria-expanded',open);
});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const observer=new IntersectionObserver(entries=>{
	entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

document.querySelectorAll('.counter').forEach(counter=>{
	const target=Number(counter.dataset.target);
	const obs=new IntersectionObserver(entries=>{
		if(!entries[0].isIntersecting)return;
		const start=performance.now(), duration=1400;
		const tick=t=>{
			const p=Math.min(1,(t-start)/duration);
			const eased=1-Math.pow(1-p,3);
			counter.textContent=Math.round(target*eased).toLocaleString();
			if(p<1)requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);obs.disconnect();
	});
	obs.observe(counter);
});

document.querySelectorAll('.tilt').forEach(card=>{
	card.addEventListener('pointermove',e=>{
		if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
		const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
		card.style.transform=`perspective(900px) rotateY(${x*4}deg) rotateX(${-y*4}deg) translateY(-4px)`;
	});
	card.addEventListener('pointerleave',()=>card.style.transform='');
});

window.addEventListener('pointermove',e=>{
	if(!hero||innerWidth<900)return;
	const x=(e.clientX/innerWidth-.5)*10, y=(e.clientY/innerHeight-.5)*7;
	hero.style.setProperty('--mx',x+'px');hero.style.setProperty('--my',y+'px');
},{passive:true});