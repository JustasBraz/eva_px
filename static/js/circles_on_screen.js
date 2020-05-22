URL_JSON = "http://127.0.0.1:5000/backlog"

var CLICKED = false;;

let data = {}; // Global object to hold results from the loadJSON call
let circles = []; // Global array to hold all bubble objects

var loaded;


var w = window.innerWidth;
var h = window.innerHeight;
var canvas;


var song;
var amp;
var current_selection;
var song_loading;

function preload() {
    loaded = loadJSON(URL_JSON);
}

// Convert saved Bubble data into Bubble Objects
function loadData() {
    let circleData = loaded.data;
    for (let i = 0; i < circleData.length; i++) {
        // Get each object in the array
        let circle = circleData[i];

        // circles.push(circle)

        console.log(circle.title)
        let color = get_category(circle.circle.category)
        let r = get_radius(circle.circle.size)

        let KB_json = circle.circle.KB_score;
        let AH_json = circle.circle.AH_score;
        let lims = determine_quadrant(KB_json, AH_json)

        //generate object positions

        //TODO:MAKE SURE NO OVERLAP
        let loc = generate_coordinates(lims);
        let x = loc[0];
        let y = loc[1];

        let metadata = {
            'id': circle.archive_id,
            'title': circle.title,
            'description': circle.description,
            'date': circle.date,
            'location': circle.location,

            'type': circle.circle.category,
            'lims': lims,
            'scores': {
                'KB': KB_json,
                'AH': AH_json
            }
        }


        circles.push(new Record(x, y, r, color, metadata));

    }
}

function generate_coordinates(lims) {
    let MAX_RADIUS = 6
    var x, y;

    function generate() {
        x = random(lims[0], lims[2])
        y = random(lims[1], lims[3])
    }
    generate();
    let circles_len = circles.length;
    if (circles_len > 0) {
        for (let i = 0; i < circles_len; i++) {
            let cx = circles[i].x;
            let cy = circles[i].y;

            if (dist(x, y, cx, cy) > MAX_RADIUS) {
                return [x, y]
            } else {
                while (dist(x, y, cx, cy) < MAX_RADIUS) {
                    generate();
                    console.log('regenerating', x, y)
                }
                return [x, y]
            }

        }

    } else {
        generate();
    }
    return [x, y]
}

function get_category(categ_json) {
    switch (categ_json) {
        case 'transportation': //blue
            return color(0, 0, 255);

        case 'supermarket': //yellow
            return color(255, 255, 0);

        case 'other': //red
            return color(255, 0, 0);

        default:
            return color(125);

    }
}

function get_radius(r_json) {

    switch (r_json) {
        case 'A': //often
            return 40

        case 'B': //sometimes
            return 15

        case 'C': //rare
            return 5

        default:
            return 5

    }
}

function determine_quadrant(KB, AH) {
    //KB Kind-Bossy
    //AH Artificial human
    AH
    let mid_value = 2
    let w_offset = 0.05 * w;
    let h_offset = 0.1 * h;
    let q1 = [w_offset, h_offset, width / 2, height / 2];
    let q2 = [width / 2, h_offset, width - w_offset, height / 2];
    let q3 = [w_offset, height / 2, width / 2, height - h_offset];
    let q4 = [width / 2, height / 2, width - w_offset, height - h_offset];

    /////////Artific////////
    ///   q1   |   q2    ///
    //K--------|---------B//
    ///   q3   |   q4    ///
    /////////Human//////////


    if (KB < mid_value && AH < mid_value) {
        return q1
    }
    if (KB > mid_value && AH < mid_value) {
        return q2
    }
    if (KB < mid_value && AH > mid_value) {
        return q3
    }
    if (KB > mid_value && AH > mid_value) {
        return q4
    } else {
        return [0, 0, width, height]

    }

}

function quadrant_lines(col) {
    stroke(col); {}

    line(w / 2, 0, w / 2, h);
    line(0, h / 2, w, h / 2);

}

function quadrant_text() {
    let offset = 20;
    textSize(18);
    textAlign(CENTER);
    fill(145)

    text('Artificial', w / 2, offset)
    text('Human', w / 2, h - offset)

    text('Kind', offset, h / 2)
    text('Bossy', w - offset, h / 2)

}

function setup() {
    canvas = createCanvas(w, h);
    canvas.position(0, 50);
    canvas.style('z-index', '-1')
    loadData();
    amp = new p5.Amplitude();
}

function draw() {
    background(255);
    // textSize(20);
    fill(0)

    // text(circles[0]['title'], 50, 50)
    quadrant_lines(200);
    quadrant_text();


    // Display all bubbles
    for (let i = 0; i < circles.length; i++) {
        circles[i].display();
       // circles[i].move();

        circles[i].rollover(mouseX, mouseY);
    }

//console.log(circles[0].x,circles[0].y)

}


// Bubble class
class Record {
    constructor(x, y, r, color, metadata) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = r;
        this.diameter = r * 2;
        this.x_noise=random(-9999,9999);
        this.y_noise=random(-9999,9999);


        this.title = metadata['title'];
        this.id = metadata['id'];
        this.scores = metadata['scores']
        this.boundary = metadata['lims']

        this.description = metadata['description']
        this.type = metadata['type']
        this.date = metadata['date']
        this.location = metadata['location']

        this.n_w=undefined;
        this.n_w=undefined;

        this.over = false;
        this.step=0.001;
    }

    // Check if mouse is over the bubble
    rollover(px, py) {
        let d = dist(px, py, this.x, this.y);
        this.over = d < this.radius;
    }

    move(){
      

        this.x_noise+=this.step;
        this.y_noise+= this.step;
        this.n_w = noise(this.x_noise);
        this.n_h = noise(this.y_noise);

        this.x=map(this.n_w,0,1 ,this.boundary[0],this.boundary[1])
        this.y=map(this.n_h,0,1 ,this.boundary[2],this.boundary[3])
        //console.log(this.id, this.x,this.y)

    }
    // Display the Bubble
    display() {
        stroke(0);
        strokeWeight(0.8);
        let changed_html = false;
        if (this.over) {
            strokeWeight(0);
            textSize(14);
            fill(0)
            text(this.title, this.x, this.y + this.radius + 20);
            // console.log(this.title, this.id)
            strokeWeight(2);

            //MODIFY HTML
            //if(!changed_html){}
            document.getElementById('text_overlay').style.display = "block"; //none

            document.getElementById('record_title').innerHTML = this.title;
            document.getElementById('record_description').innerHTML = this.description;
            document.getElementById('record_type').innerHTML = 'In a '+this.type;
            document.getElementById('record_date').innerHTML = this.date;
            document.getElementById('record_location').innerHTML = this.location;

            document.getElementById('record_play').innerHTML = 'Press on circle to play';

            //console.log(mouseIsPressed)

            if (CLICKED) {
                if (current_selection ==this.id){

                    if(song.isPlaying()){
                        song.pause();
                    }
                    else{song.play();}
                }
                else{
                    try {
                        song.stop();
                        console.log('stopped ', this.id)
                    } catch (error) {
                        console.log('no song was playing')
                    }
                    song_loading=true;
    
                    song = loadSound('static/songs/' + this.id + '.mp3', song_loaded);
                    //files/'+this.id+'/'+this.id+'.mp3
                    //static/songs/t
                    console.log(song);
                    current_selection = this.id;
                }
             
            }
            CLICKED = false;
        }


    

        if (current_selection ==this.id) {
            if(song_loading){
                strokeWeight(0);
                stroke(0);
                fill(155);
                textSize(10);
                text('Loading audio...', this.x, this.y + this.radius + 20);
                document.getElementById('record_play').innerHTML = 'Loading audio..';

    
            }
            else{
                document.getElementById('record_play').innerHTML = 'Now Playing';

            }

            try {
                let level = amp.getLevel();
                let size = map(level, 0, 1, this.diameter, this.diameter+30);
                fill(this.color)
                ellipse(this.x, this.y, size, size);
                strokeWeight(0.8);


            } catch (error) {

            }

        }else{
            
            fill(this.color)
            ellipse(this.x, this.y, this.diameter, this.diameter);
            strokeWeight(0.8);
        }
        


    }
}

function mouseReleased() {
    CLICKED = true;
}


function song_loaded() {
    if (song.isPlaying()) {
        // .isPlaying() returns a boolean
        song.pause(); // .play() will resume from .pause() position
    } else {
        song.play();
    }
    song_loading=false;

}
window.onresize = function () {
    // assigns new values for width and height variables
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.size(w, h);
}