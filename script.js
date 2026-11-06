const MENU=[
  {n:"Flat white",c:"Coffee",p:280,d:"Double ristretto, silky steamed milk."},
  {n:"Pour-over",c:"Coffee",p:320,d:"Single-origin, brewed to order."},
  {n:"Cold brew",c:"Coffee",p:300,d:"Steeped 18 hours, served over ice."},
  {n:"Masala chai",c:"Tea",p:220,d:"Black tea simmered with ginger and cardamom."},
  {n:"Jasmine green tea",c:"Tea",p:240,d:"Light, floral, refills on request."},
  {n:"Almond croissant",c:"Bakes",p:260,d:"Baked each morning, filled with frangipane."},
  {n:"Banana bread",c:"Bakes",p:200,d:"Warm slice with whipped butter."},
  {n:"Avocado toast",c:"Brunch",p:450,d:"Sourdough, lime, chili flakes, poached egg."},
  {n:"Veg club sandwich",c:"Brunch",p:420,d:"Grilled vegetables, pesto, toasted multigrain."}
];
const HOURS=[["Sun",8,20],["Mon",7,21],["Tue",7,21],["Wed",7,21],["Thu",7,21],["Fri",7,22],["Sat",8,22]];
const $=id=>document.getElementById(id);
const fmt=n=>"Rs "+n.toLocaleString("en-IN");
let cart={},cat="All";
try{cart=JSON.parse(localStorage.getItem("cafe-cart")||"{}")}catch(e){cart={}}

/* Menu */
function renderFilters(){
  const cats=["All",...new Set(MENU.map(m=>m.c))];
  $("filters").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c}</button>`).join("");
}
function renderMenu(){
  $("grid").innerHTML=MENU.filter(m=>cat==="All"||m.c===cat).map(m=>`
    <article class="item"><h3>${m.n}</h3><p>${m.d}</p>
    <div class="row"><span class="price">${fmt(m.p)}</span><button class="add" data-n="${m.n}">Add</button></div></article>`).join("");
}
$("filters").addEventListener("click",e=>{
  const b=e.target.closest(".chip");if(!b)return;
  cat=b.dataset.c;renderFilters();renderMenu();
});
$("grid").addEventListener("click",e=>{
  const b=e.target.closest(".add");if(!b)return;
  cart[b.dataset.n]=(cart[b.dataset.n]||0)+1;saveCart();renderCart();
});

/* Cart */
function saveCart(){try{localStorage.setItem("cafe-cart",JSON.stringify(cart))}catch(e){}}
function renderCart(){
  const names=Object.keys(cart).filter(n=>cart[n]>0);
  let total=0,count=0;
  $("lines").innerHTML=names.length?names.map(n=>{
    const m=MENU.find(x=>x.n===n);if(!m)return"";
    const q=cart[n];total+=m.p*q;count+=q;
    return `<li><strong>${n}</strong><span>${fmt(m.p*q)}</span>
      <div class="qty"><button data-n="${n}" data-d="-1" aria-label="Remove one ${n}">−</button>${q}<button data-n="${n}" data-d="1" aria-label="Add one ${n}">+</button></div></li>`;
  }).join(""):`<li class="empty">Your order is empty. Add something from the menu.</li>`;
  $("total").textContent=fmt(total);$("count").textContent=count;
  $("checkout").disabled=!count;$("checkout").style.opacity=count?1:.5;
}
$("lines").addEventListener("click",e=>{
  const b=e.target.closest("button[data-n]");if(!b)return;
  cart[b.dataset.n]=Math.max(0,(cart[b.dataset.n]||0)+Number(b.dataset.d));
  saveCart();renderCart();
});
function toggleCart(open){
  $("cart").classList.toggle("open",open);$("cart").setAttribute("aria-hidden",!open);
  if(open)$("closeCart").focus();else $("cartBtn").focus();
}
$("cartBtn").onclick=()=>toggleCart(true);
$("closeCart").onclick=()=>toggleCart(false);
document.addEventListener("keydown",e=>{if(e.key==="Escape")toggleCart(false)});
$("checkout").onclick=()=>{
  cart={};saveCart();renderCart();toggleCart(false);
  alert("Order placed! We’ll call your name at the counter.");
};

/* Mobile nav */
$("menuBtn").onclick=()=>{
  const o=$("nav").classList.toggle("open");$("menuBtn").setAttribute("aria-expanded",o);
};
$("nav").addEventListener("click",e=>{if(e.target.tagName==="A")$("nav").classList.remove("open")});

/* Hours + open/closed status */
function renderHours(){
  const today=new Date().getDay();
  $("hours").innerHTML=HOURS.map((h,i)=>`<li${i===today?' style="font-weight:700"':""}><span>${h[0]}</span><span>${h[1]}:00 am – ${h[2]-12}:00 pm</span></li>`).join("");
  const now=new Date(),h=HOURS[now.getDay()],hr=now.getHours()+now.getMinutes()/60;
  const open=hr>=h[1]&&hr<h[2];
  $("dot").classList.toggle("on",open);
  $("statusText").textContent=open?`Open now, until ${h[2]-12} pm`:`Closed, opens ${h[1]} am`;
}

/* Booking form */
for(let i=1;i<=8;i++)$("guests").add(new Option(i+(i===1?" guest":" guests"),i));
$("date").min=new Date().toISOString().split("T")[0];
function setErr(id,msg){$(id).setAttribute("aria-invalid",!!msg);$("e-"+id).textContent=msg}
$("form").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("name").value.trim(),phone=$("phone").value.trim(),date=$("date").value;
  const ne=name.length<2?"Enter your name.":"";
  const pe=/^(\+977)?-?9[78]\d{8}$/.test(phone.replace(/\s/g,""))?"":"Enter a valid 10-digit mobile number.";
  const de=!date?"Choose a date.":date<$("date").min?"Choose today or a later date.":"";
  setErr("name",ne);setErr("phone",pe);setErr("date",de);
  if(ne||pe||de)return;
  $("ok").hidden=false;
  $("ok").textContent=`Thanks, ${name}! Table for ${$("guests").value} on ${new Date(date).toDateString()} is reserved.`;
  $("form").reset();
});

$("yr").textContent=new Date().getFullYear();
renderFilters();renderMenu();renderCart();renderHours();
