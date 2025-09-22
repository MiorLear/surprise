const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
let W, H, DPR;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.width = Math.floor(innerWidth * DPR);
  H = canvas.height = Math.floor(innerHeight * DPR);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
}
addEventListener('resize', resize);
resize();

function hsla(h, s, l, a=1) { return `hsla(${h} ${s}% ${l}% / ${a})`; }

class Flower {
  constructor(x, y, baseR=80) {
    this.x = x; this.y = y; this.baseR = baseR;
    this.petalCount = 10;
    this.time = Math.random() * 1000;
    this.hue = 48;
  }
  draw(t) {
    const sway = Math.sin((t + this.time) * 0.0015) * 0.2;
    const scale = 1 + Math.sin((t + this.time) * 0.001) * 0.04;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    ctx.rotate(sway);

    // tallo
    ctx.lineWidth = 10 * DPR;
    ctx.strokeStyle = hsla(115, 45, 32);
    ctx.beginPath();
    ctx.moveTo(0, H*0.12);
    ctx.quadraticCurveTo(this.baseR*0.2, H*0.06, 0, 0);
    ctx.stroke();

    // pétalos
    const r = this.baseR * DPR;
    ctx.lineWidth = 2 * DPR;
    for (let i=0;i<this.petalCount;i++){
      const a = (i / this.petalCount) * Math.PI * 2;
      const px = Math.cos(a) * r * 0.1;
      const py = Math.sin(a) * r * 0.1;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(a);

      const grad = ctx.createRadialGradient(0, -r*0.45, r*0.05, 0, -r*0.45, r*0.6);
      grad.addColorStop(0, hsla(this.hue, 100, 65));
      grad.addColorStop(1, hsla(this.hue-6, 90, 45));
      ctx.fillStyle = grad;
      ctx.strokeStyle = hsla(this.hue-10, 70, 35);

      ctx.beginPath();
      ctx.ellipse(0, -r*0.45, r*0.22, r*0.62, 0, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // centro
    ctx.globalCompositeOperation = 'lighter';
    for (let i=3;i>=1;i--){
      ctx.fillStyle = hsla(38, 100, 50, 0.08*i);
      ctx.beginPath();
      ctx.arc(0, 0, r*0.36*i/3, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r*0.28);
    coreGrad.addColorStop(0, hsla(35, 100, 60));
    coreGrad.addColorStop(1, hsla(25, 90, 35));
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r*0.28, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }
}

class Sparkle {
  constructor(x, y) {
    this.x = x; this.y = y;
    const ang = Math.random()*Math.PI*2;
    const spd = 0.3 + Math.random()*0.9;
    this.vx = Math.cos(ang)*spd*DPR;
    this.vy = Math.sin(ang)*spd*DPR - 0.2*DPR;
    this.life = 600 + Math.random()*800;
    this.age = 0;
    this.size = 1 + Math.random()*2;
    this.hue = 50 + Math.random()*10;
  }
  step(dt) {
    this.age += dt;
    this.x += this.vx * dt/16;
    this.y += this.vy * dt/16;
    this.vy += 0.0006*dt;
    return this.age < this.life;
  }
  draw() {
    const a = 1 - (this.age / this.life);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.age/80) % (Math.PI*2));
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hsla(this.hue, 100, 70, 0.8*a);
    star(0,0,this.size*DPR, this.size*2*DPR, 5);
    ctx.fill();
    ctx.restore();
  }
}
function star(x,y,r,R, spikes=5) {
  ctx.beginPath();
  let rot = Math.PI/2 * 3;
  ctx.moveTo(x, y-R);
  for (let i=0;i<spikes;i++){
    ctx.lineTo(x+Math.cos(rot)*R, y+Math.sin(rot)*R);
    rot += Math.PI/spikes;
    ctx.lineTo(x+Math.cos(rot)*r, y+Math.sin(rot)*r);
    rot += Math.PI/spikes;
  }
  ctx.closePath();
}

const flowers = [];
const sparkles = [];

function initScene() {
  flowers.length = 0;
  const cx = W*0.5, cy = H*0.55;
  flowers.push(new Flower(cx, cy, Math.min(W,H)*0.12/DPR));

  // flores adicionales con más espacio
  const n = 6;
  const radius = Math.min(W,H)*0.35;
  for (let i=0;i<n;i++){
    const angle = (i/n)*Math.PI*2;
    flowers.push(new Flower(
      cx + Math.cos(angle)*radius*0.5,
      cy + Math.sin(angle)*radius*0.35,
      Math.min(W,H)*0.07/DPR
    ));
  }
}
initScene();

addEventListener('pointerdown', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * DPR;
  const y = (e.clientY - rect.top) * DPR;
  for (let i=0;i<120;i++) sparkles.push(new Sparkle(x, y));
});

let last = performance.now();
function tick(now){
  const dt = Math.min(32, now - last); last = now;
  ctx.clearRect(0,0,W,H);

  const bg = ctx.createRadialGradient(W*0.75,H*0.2,Math.min(W,H)*0.1, W*0.5,H*0.6, Math.max(W,H)*0.8);
  bg.addColorStop(0, 'rgba(255,255,255,0.6)');
  bg.addColorStop(1, 'rgba(255,223,120,0.15)');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,W,H);

  const t = now;
  for (const f of flowers) f.draw(t);

  const fx = flowers[0].x, fy = flowers[0].y;
  for (let i=0;i<6;i++) sparkles.push(new Sparkle(fx, fy - Math.random()*10));

  for (let i=sparkles.length-1;i>=0;i--){
    const s = sparkles[i];
    if (!s.step(dt)) sparkles.splice(i,1);
    else s.draw();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
