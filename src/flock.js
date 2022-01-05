import P5 from 'p5'

export function Flock() {
    // An array for all the boids
    this.boids = []; // Initialize the array
}

Flock.prototype.run = function (p5) {
    for (let i = 0; i < this.boids.length; i++) {
        this.boids[i].run(p5, this.boids);  // Passing the entire list of boids to each boid individually
    }
}

Flock.prototype.addBoid = function (b) {
    this.boids.push(b);
}

// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Boid class
// Methods for Separation, Cohesion, Alignment added

export function Boid(p5, x, y, r) {
    this.acceleration = p5.createVector(0, 0);
    this.velocity = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
    this.position = p5.createVector(x, y);
    this.r = r || 3.0;
    this.maxspeed = 3;    // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
    this.points = [];
}

Boid.prototype.run = function (p5, boids) {
    this.flock(p5, boids);
    this.update(p5);
    this.borders(p5);
    this.render(p5);
}

Boid.prototype.applyForce = function (p5, force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function (p5, boids) {
    let sep = this.separate(p5, boids);   // Separation
    let ali = this.align(p5, boids);      // Alignment
    let coh = this.cohesion(p5, boids);   // Cohesion
    // Arbitrarily weight these forces
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    // Add the force vectors to acceleration
    this.applyForce(p5, sep);
    this.applyForce(p5, ali);
    this.applyForce(p5, coh);
}

// Method to update location
Boid.prototype.update = function (p5) {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function (p5, target) {
    let desired = P5.Vector.sub(target, this.position);  // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = P5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);  // Limit to maximum steering force
    return steer;
}

Boid.prototype.render = function (p5) {
    // Draw a triangle rotated in the direction of velocity
    // let theta = this.velocity.heading() + p5.radians(90);
    // p5.fill(127);
    // p5.stroke(200);
    // p5.push();
    // p5.translate(this.position.x, this.position.y);
    // p5.rotate(theta);
    // p5.beginShape();
    // p5.vertex(0, -this.r * 2);
    // p5.vertex(-this.r, this.r * 2);
    // p5.vertex(this.r, this.r * 2);
    // p5.endShape(p5.CLOSE);
    // p5.pop();


    if (p5.frameCount % 5===0) {
        this.points.push(this.position.x, this.position.y)
    }
}

// Wraparound
Boid.prototype.borders = function (p5) {
    if (this.position.x < -this.r) this.velocity.x *= -1;// p5.width + this.r;
    if (this.position.y < -this.r) this.velocity.y *=-1;// p5.height + this.r;
    if (this.position.x > p5.width + this.r) this.velocity.x *=-1;// -this.r;
    if (this.position.y > p5.height + this.r) this.velocity.y *=-1;// -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function (p5, boids) {
    let desiredseparation = 90.0;
    let steer = p5.createVector(0, 0);
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
        let d = P5.Vector.dist(this.position, boids[i].position);
        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if ((d > 0) && (d < desiredseparation)) {
            // Calculate vector pointing away from neighbor
            let diff = P5.Vector.sub(this.position, boids[i].position);
            diff.normalize();
            diff.div(d);        // Weight by distance
            steer.add(diff);
            count++;            // Keep track of how many
        }
    }
    // Average -- divide by how many
    if (count > 0) {
        steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
        // Implement Reynolds: Steering = Desired - Velocity
        steer.normalize();
        steer.mult(this.maxspeed);
        steer.sub(this.velocity);
        steer.limit(this.maxforce);
    }
    return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function (p5, boids) {
    let neighbordist = 70;
    let sum = p5.createVector(0, 0);
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
        let d = P5.Vector.dist(this.position, boids[i].position);
        if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].velocity);
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.maxspeed);
        let steer = P5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    } else {
        return p5.createVector(0, 0);
    }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function (p5, boids) {
    let neighbordist = 100;
    let sum = p5.createVector(0, 0);   // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
        let d = P5.Vector.dist(this.position, boids[i].position);
        if ((d > 0) && (d < neighbordist)) {
            sum.add(boids[i].position); // Add location
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        return this.seek(p5, sum);  // Steer towards the location
    } else {
        return p5.createVector(0, 0);
    }
}
