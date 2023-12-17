const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d'); // Ctx = context

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const platformHeight = 1;
const maxCircles = 15;
const circles = [];
const gravity = 1000; // Earth's gravity is 9.8 but using 1000 cause looks better 
const dampening = 0.5;
const circlePool = [];


function Circle(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocityY = 15; // standart velocity by Y 
    this.velocityX = 0;

    this.draw = function () {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false); // used Math.PI = 3.14 = Full Radius of circle is 2*PI
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#acacac';
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.closePath();
    };

    this.update = function (deltaTime) {
        this.velocityY += gravity * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.x += this.velocityX * deltaTime;

        
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.velocityX *= -dampening;
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.velocityX *= -dampening;
        }

        if (this.y + this.radius > canvas.height - platformHeight) {
            this.y = canvas.height - platformHeight - this.radius;
            this.velocityY *= -dampening;
        }

        // Collision
        circles.forEach(otherCircle => {
            if (otherCircle !== this) {
                const dx = this.x - otherCircle.x;
                const dy = this.y - otherCircle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + otherCircle.radius) {
                    const angle = Math.atan2(dy, dx);
                    const overlap = this.radius + otherCircle.radius - distance;

                    
                    this.x += (overlap / 2) + Math.cos(angle);
                    this.y += (overlap / 2) + Math.sin(angle);

                    otherCircle.x -= (overlap / 2) * Math.cos(angle);
                    otherCircle.y -= (overlap / 2) * Math.sin(angle);

                    // Reflect velocities
                    const normalX = dx / distance;
                    const normalY = dy / distance;
                    const relativeVelocityX = this.velocityX - otherCircle.velocityX;
                    const relativeVelocityY = this.velocityY - otherCircle.velocityY;
                    const relativeVelocity = relativeVelocityX * normalX +relativeVelocityY * normalY;

                    this.velocityX -= 1 * relativeVelocity * normalX;
                    this.velocityY -= 1 * relativeVelocity * normalY;

                    otherCircle.velocityX += 1 * relativeVelocity * normalX;
                    otherCircle.velocityY += 1 * relativeVelocity * normalY;
                }
            }
        });

        this.draw();
    };
} 

function spawnCircle(x, y) {
    const radius = 40;
    const color = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;

    let circle = getCircle();
    circle.x = x;
    circle.y = y;
    circle.radius = radius;
    circle.color = color;
    circle.opacity = 1;
    circle.velocityX = (Math.random() - 0.5) * 50;

    circles.push(circle);
    updateInfo();
}

const info = document.getElementById('info');

function updateInfo() {
    
    info.innerHTML = `Circles on screen: ${circles.length} / ${maxCircles}`;
}


function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();
    const deltaTime = (now - then) / 1000;
    then = now;

    circles.forEach(circle => {
        circle.update(deltaTime);
        circle.draw();
    });


    if (circles.length > maxCircles) {
        let removedCircle = circles.splice(0, circles.length - maxCircles);
        updateInfo();
        circlePool.push(removedCircle)
    }
    
}

function getCircle (circlePool){
    if (circlePool == null) {
        return new Circle();
    }

    if (circlePool.length !== 0) {
        return circlePool.pop();
    }

    return new Circle();
  }

    


let then = performance.now();
canvas.addEventListener('click', (e) => {
    const clickX = e.clientX;
    const clickY = e.clientY;
    spawnCircle(clickX, clickY);
});

animate();