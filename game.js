const gravitiy = 62;
const jump = -25;
const GroundLevel = 2
const scale = 8;
const drawingscale = `2.5`
let width = 50;
// if(window.innerWidth  < 1000) width = 20
let height = 22
// let width  = (window.innerWidth / scale) 
// let height = (window.innerHeight / scale) - (window.innerHeight * 0.2 / scale)


const keys = trackkey()

Array.prototype.last = function(){
    return this[this.length - 1]
}


class FrameTracker {
    constructor(scale){
        this.scale = scale
        this.frames={}
        this.lastanimtion = null
    }

    add(actorsize,framesname,framesnumber,backgroundphoto,framesspeed){
        if(!this.frames[framesname]){
            this.frames[framesname] = { }        
        }
        this.frames[framesname] = {
            backgroundphoto,
            anmtionframes:this.generateFrames(actorsize,framesnumber,this.scale),
            index:0,
            framesspeed
        }

    }

    generateFrames(actorsize,framesnumber,scale){
        let res = []
        for(let i = 0 ; i < framesnumber ; i++){
            if(i==0)res.push([(actorsize.x - actorsize.y) * scale / 2,0])
            else res.push([res[i-1][0] - actorsize.x*2 * scale,0])
        }
        return res
    }

    nextFrame(framesname){
        let frame = this.frames[framesname].anmtionframes[Math.trunc(this.frames[framesname].index)]
        this.frames[framesname].index = (this.frames[framesname].index + this.frames[framesname].framesspeed) % this.frames[framesname].anmtionframes.length
        return frame
    }

    update(actorhtmlelement,animtionname,actor){
        for(let animtion in this.frames){
            if(this.frames[animtion].index != 0 && animtion != animtionname){
                this.rest(animtion)
            }
        }
        let frame = this.nextFrame(animtionname)
        actorhtmlelement.style.backgroundImage = `url(${this.frames[animtionname].backgroundphoto})`
        actorhtmlelement.style.backgroundSize = "cover"
        actorhtmlelement.style.backgroundRepeat = "no-repeat"
        actorhtmlelement.style.backgroundPosition = `${frame[0]}px ${frame[1]}px`
        if(actor.type.indexOf("obstacle") !== -1)
        actorhtmlelement.style.transform = `scale(${-drawingscale},${drawingscale})`

    }

    rest(framesname){
        this.frames[framesname].index = 0
    }

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


function makeelment(tag,attrs,childeren = []){
    let element = document.createElement(tag)
    for(let key in attrs){
        element.setAttribute(key,attrs[key])
    }
    for(let child of childeren){
        element.appendChild(child)
    }
    return element
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
        
    })
    window.addEventListener("touchstart",(e)=>{

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
        this.display = new display(this)
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
            let random = [Skelton][0]
            this.obstacles.push(random.create(new Vector((this.width * 1.6)  +  distancebeteenobstacles * i,this.height)))
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

        return new Game(width,height,scale,"idle",new Player(new Vector(0,0),new Vector(2,height - Player.prototype.size.y  - GroundLevel),"onground"),Display,highest)
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
        
    }
    run(time){
        
        this.running = true;
        if(!this.game){
             this.game = Game.newgame(this.highestscore)
             this.olddisplay.clear()
             this.olddisplay = this.game.display
            }
        if(this.lasttime){
            let frametime =1/60
            if(this.game.state == "lost"){
                this.game.update(frametime,this.keys)
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


class Display{
    constructor(game){
        this.game = game
        this.frametracker = new FrameTracker(game.scale)
        this.frametracker.add("obstaclemid",Skelton.prototype.size,"walking",8,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Skeleton/Walk.png",0.1)
        this.actors = null
        this.interval = null
        this.score = makeelment("div",{"class":"score"})
        this.frame = makeelment("div",{"style":`width:${game.width * game.scale}px;height:${game.height * game.scale}px`,"class":`game`},[this.score])
        document.body.appendChild(this.frame)
    }

    sync(newgame){
        this.frame.setAttribute("class",`game ${newgame.state}`)
        if(this.actors) this.actors.remove()
        this.score.textContent = `${this.game.highestscore ? `HI ${Math.trunc(this.game.highestscore)}` : ``} ${Math.trunc(newgame.score)}`
        this.actors = makeelment("div",{},this.drawactors(newgame.obstacles.concat(newgame.player)))
        this.frame.appendChild(this.actors)
        let scaleX = (window.innerWidth ) / (scale * width ) 
        this.changesizeframe(scaleX,scaleX)
        createKeyframes(this.game)
        if(!this.interval){
            this.interval = setInterval(()=>{
                let scaleX = (window.innerWidth ) / (scale * width ) 
                this.changesizeframe(scaleX,scaleX)
                createKeyframes(this.game)
            },100)

        }
    }

    clear(){
        clearInterval(this.interval)
        this.frame.remove()
    }

    drawactors(actors){
        let actorselemtns = []
        for(let actor of actors){
            let element = makeelment("div",{"style":`top:${actor.postionVector.y * this.game.scale}px;left:${actor.postionVector.x * this.game.scale}px;width:${actor.size.x * this.game.scale}px;height:${actor.size.y * this.game.scale}px;transform:scale(${drawingscale})`,"class":`actor ${actor.type} ${actor.type == "player" ? actor.state : ""}`})
            actorselemtns.push(element)
            actor.frames.update(element,actor.state,actor)
        }
        return actorselemtns
    }
    changesizeframe(scaleX,scaleY){
        //Xframewidrh = newwidth
        //x = newwidth / frame
        this.frame.style.transform = `scaleX(${scaleX}) scaleY(${scaleY})`
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
        this.frames = new FrameTracker(scale)
        this.frames.add(this.size,"idle",6,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Idle.png",0.2)
        this.frames.add(this.size, "running",8,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Run.png",0.25)
        this.frames.add(this.size,"jumping",11,"./assets/craftpix-net-439247-free-fantasy-chibi-male-sprites-pixel-art/Wizard/Jump.png",0.2)
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
                this.speedVector.y = jump * 1.2
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
        //for cheaters
        // else if(this.speedVector.y >= 0 && suggestjump){
        //     this.speedVector.y = jump
        // }
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
    }
}
Player.prototype.size = new Vector(1,2)


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
        //  if(this.postionVector.x - 5 < game.player.postionVector.x  + game.player.size.x&& this.postionVector.y <= game.player.postionVector.y){
        //     this.state = "attack"
        //     this.frames.rest("walking")
        // }
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
        this.frames = new FrameTracker(scale)
        this.frames.add(this.size,"walking",8,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Skeleton/Walk.png",0.1)
        this.frames.add(this.size,"attack",7,"./assets/craftpix-net-339194-free-fantasy-enemies-pixel-art-sprite-pack/Skeleton/Attack_3.png",0.1)
    }
    get type(){
        return"obstaclemid"
    }

}
Skelton.prototype.size = new Vector(1,2)


function createKeyframes(game) {
    const container = document.querySelector('.container');
    const containerWidth = width * scale

    // Create a style element
    const style = document.createElement('style');
    style.type = 'text/css';
    const keyframes = `
                @keyframes gamebg {
                    from {
                        background-position: 0 bottom;
                    }
                    to {
                        background-position: -${containerWidth}px bottom;
                    }
                }
            `;
            // Append the keyframes rule to the style element
            style.innerHTML = keyframes;
            console.log(containerWidth)
            // Append the style element to the document head
            document.head.appendChild(style);
        }



let game = new GameRunner(keys)

// window.addEventListener("keydown",(e)=> {

//     if(keys.arrowup && ( !game.game ||game.game.state ==  "idle")){
//         keys.arrowup = false
//         game.start()
//     }
//     })

// window.addEventListener("touchstart",()=>{
//     if(keys.arrowup && ( !game.game ||game.game.state ==  "idle")){
//         keys.arrowup = false
//         game.start()
//     }
// })



// setTimeout(()=>{

// },300)
