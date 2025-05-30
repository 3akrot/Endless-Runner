// game.js
const gravitiy = 60;
const jump = -25;
const GroundLevel = 5
const scale = 20;
let width = 50;
let height = 30;
let bg;




const keys = trackkey()

Array.prototype.last = function(){
    return this[this.length - 1]
}



class Vector{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    add(vector){
        this.x += vector.x
        this.y += vector.y
    }

    times(factor){
        this.x *= factor
        this.y *= factor
    }
} 


function rounddecimat(d){
    return Number.parseFloat(d.toFixed(2))
}


function overlap(actor1,actor2){
    return actor1.postionVector.x + actor1.size.x >= actor2.postionVector.x 
    && actor1.postionVector.x  <= actor2.postionVector.x + actor2.size.x 
    && actor1.postionVector.y  + actor1.size.y  >= actor2.postionVector.y 
    && actor1.postionVector.y <= actor2.postionVector.y + actor2.size.y 
}


function randomrange(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min
}





function trackkey(){
    
    const keys = {
        "arrowup":false
    }
    window.addEventListener("keydown",(e)=>{
            if(e.key === "ArrowUp"){
                keys["arrowup"] = true;
                e.preventDefault()
            }
            if(e.key === ' '){
                keys["space"] = true;
                setTimeout(()=>{
                    keys["space"] = false;

                },600)
                e.preventDefault()
            }
        
    })
    window.addEventListener("touchstart",()=>{
        keys["arrowup"] = true;
    })
    window.addEventListener("touchend",()=>{
        keys["arrowup"] = false
    })
    window.addEventListener("keyup",(e)=>{
        if(e.key === "ArrowUp"){
            keys["arrowup"] = false;
        }

    })
    return keys
}


class Game {
    constructor(width,height,scale,state,player,display,highestscore){
        this.width = width
        this.height = height
        this.scale = scale
        this.player = player
        this.obstacles = []
        this.score = 0
        this.highestscore = highestscore
        this.state = state
        this.incrmentdiff = 30;
        this.obstaclespeed = -2;
        this.spawnrate = -(1.2 * this.width)/Obstacle.prototype.speed.x;
        // this.display = new display(this)
        this.display = new CavasDisplay(this)
    }

    updateactors(frametime,keys){
        for(let obstacle of this.obstacles){
            obstacle.update(this,frametime)
            if(this.state  == "lost"){


                this.display.sync(this)

                return this.score
            }
        }
        this.player.update(this,frametime,keys)
    }

    spawnobstacles(count){
        for(let i = 0 ; i < count ; i++){
            let distancebeteenobstacles = randomrange(this.width * 0.2,this.width * 2)
            let random = [Skelton,Sperm,Plent][Math.floor(Math.random() * 3)]
            this.obstacles.push(random.create(new Vector((this.width * 1.6)  +  distancebeteenobstacles * i,this.height )))
        }
    }
    update(frametime,keys){
        this.score += (frametime * 10)
        this.updateactors(frametime,keys)
        if((this.obstacles.length == 0 || this.obstacles.last().postionVector.x < this.width)){
            this.spawnobstacles(2)
        }
        if(this.score < 400 && Math.trunc(this.score) % 10 ==0){
            Obstacle.prototype.speed.x-=0.06
        }
        this.display.sync(this)
    }

    static newgame(highest){

        return new Game(width,height,scale,"idle",new Player(new Vector(0,0),new Vector(2,height - Player.prototype.size.y  - GroundLevel ),"onground"),CavasDisplay,highest)
    }
}


class GameRunner{
    constructor(keys){
        this.keys = keys
        this.lasttime = null
        this.highestscore = 0;
        this.game = Game.newgame(this.highestscore)
        this.game.update(1/60,keys)
        this.olddisplay = this.game.display
        this.idleanimation(this.game)
        // respnosive(this,true)

    }
    idleanimation(game){
        this.game.display.sync(this.game)
        if(this.game.state != "idle"){
            
        }
        else{
            requestAnimationFrame(()=>{this.idleanimation(this.game)})
        }
    }
    start(){
        if(!this.running)
            this.run()
            // respnosive(this,false)
        
    }
    run(time){
        this.running = true;
        if(!this.game){
             this.game = Game.newgame(this.highestscore)
             this.olddisplay.clear()
             this.olddisplay = this.game.display
            }
        if(this.lasttime){
            let frametime = Math.min(time - this.lasttime,50) / 1000
            if(this.game.state == "lost"){
                this.highestscore = Math.max(this.game.score,this.highestscore)
                this.olddisplay = this.game.display
                this.game = null
                this.lasttime = null
                Obstacle.prototype.speed = new Vector(-14,0)
                this.running = false;
            

                return
            }
            else{
                this.game.state= "playing"
                this.game.update(frametime,this.keys)

            }
        }
        this.lasttime = time
        requestAnimationFrame((time)=>{this.run(time)})
    }

}




class Frames {
    constructor(){
        this.animtions = {}
        
    }
    addAnimtion(animtionName,FrameNumber,src,speed){
        this.animtions[animtionName] = {src,currentFrame:0,FrameNumber,width:128,speed,restFrames:undefined}
    }
    next(animtionName){
        let current = this.animtions[animtionName].currentFrame
        this.animtions[animtionName].currentFrame = (current + (this.animtions[animtionName].speed || 0.3)) % this.animtions[animtionName].FrameNumber
        clearTimeout(this.animtions[animtionName].restFrames)
        this.animtions[animtionName].restFrames = setTimeout(()=>{
            this.rest(animtionName)
        },50)
        console.log(this.animtions)

    }
    rest(animtionName){
        this.animtions[animtionName].currentFrame = 0
    }
}

class CavasDisplay {
   constructor(game){
    this.game = game;
    this.canves = document.createElement("canvas");
    this.canves.width = game.width * scale;
    this.canves.height = game.height * scale;
    this.cx = this.canves.getContext("2d");  
    document.body.appendChild(this.canves);
    
   }
   sync(newgame){
        this.cx.clearRect(0,0,this.canves.width,this.canves.height)
        
        this.drawActors(newgame.obstacles.concat(newgame.player))
        this.drawScore(newgame)
    }
    drawScore(newgame){
        let textContent = `${this.game.highestscore ? `HI ${Math.trunc(this.game.highestscore)}` : ``} ${Math.trunc(newgame.score)}`
        this.cx.fillText(textContent,0,10);

    }
   drawActor(actor){
    let currentFrame = Math.floor(actor.frames.animtions[actor.state].currentFrame)
    let frameWidth = actor.frames.animtions[actor.state].width
    let src = actor.frames.animtions[actor.state].src
    let img = document.createElement("img")
    let drawingscale = actor.Drawsize
    img.src = src
    // this.cx.scale(2,2)]
    this.cx.fillStyle = "black"
    let x = (actor.postionVector.x * scale) -(( scale * drawingscale) * 0.5) + ((scale ) * 0.5)
    let y =(actor.postionVector.y * scale) -((scale * drawingscale) * 0.5) + ((scale ) * 0.5)
    this.cx.fillRect(x,y, scale * drawingscale,  scale * drawingscale)

    this.cx.fillStyle = "red"

    this.cx.fillRect(actor.postionVector.x * scale , actor.postionVector.y * scale , actor.size.x * scale , actor.size.y * scale)

    if(actor.type !== "player"){
        this.cx.scale(-1,1)
        this.cx.drawImage(img,currentFrame * frameWidth ,0,frameWidth,128,-x , y,-scale * drawingscale , scale * drawingscale)

    }
    else {
        this.cx.drawImage(img,currentFrame * frameWidth ,0,frameWidth,128,x , y, scale * drawingscale , scale * drawingscale)
    }
    actor.frames.next(actor.state)
    this.cx.resetTransform()

   }
   drawActors(actors){
    for(let actor of actors){
        this.drawActor(actor)

    }
    }
    changesizeframe(scaleX,scaleY){
        //Xframewidrh = newwidth
        //x = newwidth / frame
        // this.canves.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
    }
    clear(){
        this.canves.remove()
    }
}


class Player{
    constructor(speedVector,postionVector,state){
        this.state = state
        this.speedVector = speedVector
        this.postionVector = postionVector
        this.lastarrowup = true
        this.allowedjumps = 1
        this.jumps = this.allowedjumps;
        this.state = "idle"
        this.firstupdate = true
        // this.frames = new FrameTracker(scale)
        this.frames = new Frames()
        this.frames.addAnimtion("idle",6,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Idle.png",0.2)
        // this.frames.add(this.size,"idle",6,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Idle.png",0.2)
        this.frames.addAnimtion("running",8,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Run.png",0.25)
        // this.frames.add(this.size, "running",8,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Run.png",0.25)
        this.frames.addAnimtion("jumping",11,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Jump.png",0.25)
        // this.frames.add(this.size, "jumping",11,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Jump.png",0.25)
        
        this.frames.addAnimtion("Attack_1",10,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Attack_1.png",0.2)
        this.frames.addAnimtion("Attack_2",4,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Attack_2.png",0.2)
        this.frames.addAnimtion("Attack_3",7,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Attack_3.png",0.2)


        // this.frames.add(this.size,"Attack_1",10,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Attack_1.png",0.2)
        // this.frames.add(this.size,"Attack_2",4,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Attack_2.png",0.2)
        // this.frames.add(this.size,"Attack_3",7,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Attack_3.png",0.2)


    }

    get type(){
        return "player"
    }

    update(game,timeframe,arrowkey){
        let suggestjump = false;

        for(let obstacle of game.obstacles){
            if(obstacle.postionVector.x > this.postionVector.x + this.size.x && obstacle.postionVector.x - (-Obstacle.prototype.speed.x / 3.1 )< this.postionVector.x + this.size.x)
                suggestjump = true
        }
        if (this.postionVector.y + this.size.y < game.height - GroundLevel  ){
            if(this.jumps > 0 &&  arrowkey.arrowup && !this.lastarrowup ){
                this.speedVector.y = jump + 5
                this.jumps--;
            }
            this.state = "jumping"
            //if the player is in the air incrase its speed according to gravitiy
            this.speedVector.y = this.speedVector.y + timeframe * gravitiy
        }
        else if(arrowkey.arrowup && this.speedVector.y >= 0){
            //if the player hit arrow up and the player is not jumping
            //we make the player jump by reversing its speed
            this.speedVector.y = jump 
            this.jumps = this.allowedjumps
        }
        // for cheaters
        else if(this.speedVector.y >= 0 && suggestjump){
            this.speedVector.y = jump
        }
        else{
            if(!this.firstupdate)
            this.state = "running"
            this.firstupdate = false
            this.speedVector.y = 0
        }
        //this part for appling the movment
        let moveYdistance = this.speedVector.y * timeframe
        if(!(this.postionVector.y +this.size.y + moveYdistance >game.height - GroundLevel)){
            this.postionVector.y = this.postionVector.y + moveYdistance

        }
        else{
            this.postionVector.y =  game.height - GroundLevel -this.size.y
        }
        this.lastarrowup = arrowkey.arrowup
        if(keys.space)
            {
                this.state = `Attack_3`
            }
            console.log(this.state)

    }
}
Player.prototype.size = new Vector(1,3)



class Obstacle{
    constructor(speedVector,postionVector,state){
        this.speedVector = speedVector
        this.postionVector = postionVector
        this.state = state
    }

    get type(){
        return "obstacle"
    }

    update(game,timeframe){
        if(overlap(game.player , this)){
            //the player hit an obstacle we make the game lost
            game.state = "lost"
        }
        else if(this.postionVector.x + this.size.x < -100){
            //if its x postion smaller than 0 it means that the obstacle is of the screen
            //and we should remove it from the qeue
            game.obstacles.shift()
        }
        else {
            //we update the obstacle postion according to its speed
            let moveX = rounddecimat(this.speedVector.x * timeframe)
            this.postionVector.x = rounddecimat(this.postionVector.x + moveX)
        }
         if(this.postionVector.x -20  < game.player.postionVector.x  + game.player.size.x && this.postionVector.y <= game.player.postionVector.y && game.player.postionVector.y + game.player.size.y <= this.postionVector.y + this.size.y){
            this.state = "attack"
            console.log("attacking the player")
            this.frames.rest("walking")
        }
    }
    static create(postionVector){
        postionVector.add(new Vector(0 , -(this.prototype.size.y + GroundLevel)))
        return new this(this.prototype.speed,postionVector,"walking")
    }
}
Obstacle.prototype.speed = new Vector(-14,0)



class Skelton extends Obstacle{
    constructor(speedVector,postionVector,state){
        super(speedVector,postionVector,state)
        this.frames = new Frames()
        // this.frames = new FrameTracker(scale)
        console.log(this.size , "sizehere")
        this.frames.addAnimtion("walking",8,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Skeleton/Walk.png",0.1)
        this.frames.addAnimtion("attack",7,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Skeleton/Attack_3.png",0.1)

        // this.frames.add("walking",8,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Skeleton/Walk.png",0.1)
        // this.frames.add("attack",7,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Skeleton/Attack_3.png",0.1)
    }
    get type(){
        return"obstaclemid"
    }

}

class Sperm extends Obstacle{
    constructor(speedVector,postionVector,state){
        super(speedVector,postionVector,state)
        this.frames = new Frames()
        // this.frames = new FrameTracker(scale)
        this.frames.addAnimtion("walking",7,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Fire_Spirit/Walk.png",0.1)
        this.frames.addAnimtion("attack",7,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Fire_Spirit/Attack.png",0.1)
    }

    static create(postionVector){
        postionVector.add(new Vector(0 , -(this.prototype.size.y + GroundLevel + Math.floor(Math.random()* 10))))
        return new this(this.prototype.speed,postionVector,"walking")
    }

}
class Plent extends Obstacle{
    constructor(speedVector,postionVector,state){
        super(speedVector,postionVector,state)
        this.frames = new Frames()
        // this.frames = new FrameTracker(scale)
        this.frames.addAnimtion("walking",9,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Plent/Walk.png",0.1)
        this.frames.addAnimtion("attack",8,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Plent/Attack_3.png",0.1)

        // this.frames.add(this.size,"walking",9,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Plent/Walk.png",0.1)
        // this.frames.add(this.size,"attack",6,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Plent/Attack_1.png",0.1)
    }


}
Player.prototype.Drawsize = 5
Sperm.prototype.size = new Vector(2,1)
Sperm.prototype.Drawsize = 5
Plent.prototype.size = new Vector(1,3)
Plent.prototype.Drawsize = 5

Skelton.prototype.size = new Vector(1,3)
Skelton.prototype.Drawsize = 5




// function createKeyframes(game) {
//     const container = document.querySelector('.container');
//     const containerWidth = width * scale

//     // Create a style element
//     const style = document.createElement('style');
//     style.type = 'text/css';
//     const keyframes = `
//                 @keyframes gamebg {
//                     from {
//                         background-position: 0 bottom;
//                     }
//                     to {
//                         background-position: -${containerWidth}px bottom;
//                     }
//                 }
//             `;
//             // Append the keyframes rule to the style element
//             style.innerHTML = keyframes;
//             // Append the style element to the document head
//             document.head.appendChild(style);
//         }



let game = new GameRunner(keys)

window.addEventListener("keydown",(e)=> {
    if(keys.arrowup && ( !game.game ||game.game.state ==  "idle")){
        keys.arrowup = false
        game.start()
    }
    })
window.addEventListener("touchstart",()=>{
    if(keys.arrowup && ( !game.game ||game.game.state ==  "idle")){
        keys.arrowup = false
        game.start()
    }
})


// function respnosive(game,smouth){
//     if(smouth) game.olddisplay.frame.style.transition = "0.5s"
//     else game.olddisplay.frame.style.transition = ""
//     let scaleX = document.documentElement.clientWidth / (scale * width) 
//     game.olddisplay.changesizeframe(scaleX,scaleX)
// }
// window.addEventListener("resize",()=>{
//     respnosive(game,true)

// })


// setInterval(()=>{
//     console.log(window.innerWidth)
// },500)