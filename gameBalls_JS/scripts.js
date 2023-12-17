const canvas = document.getElementById('gravityCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const platformHeight = 20;
const maxCircles = 15;
const circles = [];
const gravity = 9.8; // Earth's gravity 
const dampening = 0.7;

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
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#34495e';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.closePath();
    };

    this.update = function (deltaTime) {
        this.velocityY += gravity * deltaTime;
        this.y += this.velocityY * deltaTime;

        this.x += this.velocityX * deltaTime;

        // Ensure the circle stays within the horizontal bounds of the platform
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

        // Collision detection and response with other circles
        circles.forEach(otherCircle => {
            if (otherCircle !== this) {
                const dx = this.x - otherCircle.x;
                const dy = this.y - otherCircle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.radius + otherCircle.radius) {
                    const angle = Math.atan2(dy, dx);
                    const overlap = this.radius + otherCircle.radius - distance;

                    // Separate the circles to avoid overlap
                    this.x += (overlap / 2) * Math.cos(angle);
                    this.y += (overlap / 2) * Math.sin(angle);

                    otherCircle.x -= (overlap / 2) * Math.cos(angle);
                    otherCircle.y -= (overlap / 2) * Math.sin(angle);

                    // Reflect velocities
                    const normalX = dx / distance;
                    const normalY = dy / distance;
                    const relativeVelocityX = this.velocityX - otherCircle.velocityX;
                    const relativeVelocityY = this.velocityY - otherCircle.velocityY;
                    const relativeVelocity = relativeVelocityX * normalX + relativeVelocityY * normalY;

                    this.velocityX -= 2 * relativeVelocity * normalX;
                    this.velocityY -= 2 * relativeVelocity * normalY;

                    otherCircle.velocityX += 2 * relativeVelocity * normalX;
                    otherCircle.velocityY += 2 * relativeVelocity * normalY;
                }
            }
        });

        this.draw();
    };
}

function spawnCircle(x, y) {
    if (circles.length < maxCircles) {
        const radius = 20;
        const color = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
        const circle = new Circle(x, y, radius, color);

        // Initial horizontal velocity range for faster movement
        circle.velocityX = (Math.random() - 0.5) * 50;

        circles.push(circle);
        updateInfo();
    }
}

function updateInfo() {
    const info = document.getElementById('info');
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
    });

    // Remove excess circles beyond the limit
    if (circles.length > maxCircles) {
        circles.splice(0, circles.length - maxCircles);
        updateInfo();
    }
}

let then = performance.now();
canvas.addEventListener('click', (e) => {
    const clickX = e.clientX;
    const clickY = e.clientY;
    spawnCircle(clickX, clickY);
});

animate();