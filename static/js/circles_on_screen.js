URL_JSON = "/backlog"

var CLICKED = false;;


let data = {}; // Global object to hold results from the loadJSON call
let circles = []; // Global array to hold all bubble objects

var loaded;


var w = window.innerWidth;
var h = window.innerHeight - 60;
var canvas;


var mid_value = 3;

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

        // console.log(circle.title)
        let color = get_category(circle.circle.category)
        let r = get_radius(circle.circle.frequency)

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
    let MAX_RADIUS = 50;
    var x, y;

    function generate() {
        x = random(lims[0], lims[2])
        y = random(lims[1], lims[3])
    }
    generate();

    let circles_len = circles.length;
    // console.log('len:',circles_len)
    if (circles_len > 0) {
        for (let i = 0; i < circles_len; i++) {
            // console.log('current', x,y)
            let cx = circles[i].x;
            let cy = circles[i].y;

            if (dist(x, y, cx, cy) > MAX_RADIUS) {
                // console.log(i,int(dist(x, y, cx, cy)), MAX_RADIUS)
               continue;
            } else {
                let counter=0;
                while (dist(x, y, cx, cy) < MAX_RADIUS) {
                    counter++;
                    generate();
                    i=0;
                    if(counter>10){
                        return [x, y];

                    }
                    // console.log('regenerating', x, y,'because', dist(x, y, cx, cy), MAX_RADIUS)
                }
               // return [x, y]
            }

        }
        return [x, y];

    } else {
        generate();
    }
    return [x, y]
}

function get_category(categ_json) {
    let alpha=150;
    switch (categ_json) {
        case 'transportation': //blue
            return color(0, 0, 255,alpha);

        case 'supermarket': //yellow
            return color(255, 255, 0,alpha);

        case 'other': //red
            return color(255, 0, 0,alpha);

        default:
            return color(125,alpha);

    }
}

function get_radius(r_json) {

    switch (r_json) {
        case 'often': //often
            return 40

        case 'sometimes': //sometimes
            return 30

        case 'rare': //rare
            return 20

        default:
            return 5

    }
}

function determine_quadrant(KB, AH) {
    //KB Kind-Bossy
    //AH Artificial human

    let w_0=0.05 * w;
    let w_1=w-w_0;

    let y_0=0.05 * h;
    let y_1=h-y_0;

    let Ux=w_1/6.2;
    let Uy=y_1/6.2;

    return [(KB+0)*Ux+w_0, (AH+0)*Uy+y_0, (KB+1)*Ux+w_0,(AH+1)*Uy+y_0 ]


}

function quadrant_lines(col) {
    stroke(col); 
    strokeWeight(0.8);
    line(0, h / 2, w, h / 2);
    line(w / 2, 0, w / 2, h);
   

}

function quadrant_text() {
    let off_t = 5;
    textSize(18);
    textAlign(CENTER);
    fill(255);
    noStroke();
    //artificial
    rect(w / 2 + 50, 50, -100, -50);
    //natural
    rect(w / 2 + 50, h, -100, -35);
    //authoritarian
    rect(w + 45, h / 2 + 10, -200, -25);
    //benevolent
    rect(140, h / 2 + 10, -200, -25);



    fill(145)
    text('ARTIFICIAL', w / 2, 45)
    text('NATURAL', w / 2, h - 20)

    text('BENEVOLENT', 80, h / 2 + off_t)
    text('AUTHORITARIAN', w - 80, h / 2 + off_t)

}

function setup() {
    canvas = createCanvas(w, h);
    canvas.position(0, 60);
    canvas.style('z-index', '-1')
    loadData();
    amp = new p5.Amplitude();
}

function draw() {
    background(255);
    // textSize(20);
    fill(0)

    quadrant_lines(100);
    quadrant_text();


    // Display all bubbles
    for (let i = 0; i < circles.length; i++) {
        circles[i].display();
         //circles[i].move();

        circles[i].rollover(mouseX, mouseY);

        //DEBUG:
    //     rectMode(CORNERS); // Set rectMode to CORNERS
    //    noFill();
    //      let q1=circles[i].boundary;
    //     rect(q1[0], q1[1], q1[2], q1[3]);
    //     rectMode(CORNER); // Set rectMode to CORNERS


    }

   


}


// Bubble class
class Record {
    constructor(x, y, r, color, metadata) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = r;
        this.diameter = r * 2;
        this.x_noise = random(-9999, 9999);
        this.y_noise = random(-9999, 9999);


        this.title = metadata['title'];
        this.id = metadata['id'];
        this.scores = metadata['scores']
        this.boundary = metadata['lims']

        this.description = metadata['description']
        this.type = metadata['type']
        this.date = metadata['date']
        this.location = metadata['location']

        this.n_w = undefined;
        this.n_w = undefined;

        this.over = false;
        this.step = 0.001;
    }

    // Check if mouse is over the bubble
    rollover(px, py) {
        let d = dist(px, py, this.x, this.y);
        this.over = d < this.radius;
    }

    move() {


        this.x_noise += this.step;
        this.y_noise += this.step;
        this.n_w = noise(this.x_noise);
        this.n_h = noise(this.y_noise);

        this.x = map(this.n_w, 0, 1, this.boundary[0], this.boundary[1])
        this.y = map(this.n_h, 0, 1, this.boundary[2], this.boundary[3])


    }
    // Display the Bubble
    display() {
        let strokeWidth=0.2;
        let alpha=0;
        stroke(0);
        strokeWeight(strokeWidth);
        let changed_html = false;
        if (this.over) {
            strokeWeight(0);
            textSize(14);
            fill(0)
            text(this.title, this.x, this.y + this.radius + 20);
            // console.log(this.title, this.id)
            strokeWeight(1);

            //MODIFY HTML
            //if(!changed_html){}
            document.getElementById('text_overlay').style.display = "inline-block"; //none

            document.getElementById('record_title').innerHTML = this.title;
            // document.getElementById('record_description').innerHTML = this.description;
            // document.getElementById('record_type').innerHTML = 'In a '+this.type;
            document.getElementById('record_date').innerHTML = this.date;
            document.getElementById('record_location').innerHTML = this.location;

            document.getElementById('record_play').innerHTML = 'Press on circle to play';

            //console.log(mouseIsPressed)

            if (CLICKED) {
                if (current_selection == this.id) {

                    if (song.isPlaying()) {
                        song.pause();
                    } else {
                        song.play();
                    }
                } else {
                    try {
                        song.stop();
                        console.log('stopped ', this.id)
                    } catch (error) {
                        console.log('no song was playing')
                    }
                    song_loading = true;

                    song = loadSound('static/files/' + this.id + '/' + this.id + '.mp3', song_loaded);
                    //files/'+this.id+'/'+this.id+'.mp3
                    //static/songs/t
                    console.log(song);
                    current_selection = this.id;
                }

            }
            CLICKED = false;
        }




        if (current_selection == this.id) {
            if (song_loading) {
                strokeWeight(0);
                stroke(0);
                fill(155);
                textSize(10);
                text('Loading audio...', this.x, this.y + this.radius + 20);
                document.getElementById('record_play').innerHTML = 'Loading audio..';


            } else {
                document.getElementById('record_play').innerHTML = 'Now Playing';

            }

            try {
                let level = amp.getLevel();
                let size = map(level, 0, 1, this.diameter, this.diameter + 30);
                fill(this.color)
                ellipse(this.x, this.y, size, size);
                strokeWeight(strokeWidth);


            } catch (error) {

            }

        } else {

            fill(this.color)
            ellipse(this.x, this.y, this.diameter, this.diameter);
            strokeWeight(strokeWidth);
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
    song_loading = false;

}
window.onresize = function () {
    // assigns new values for width and height variables
    w = window.innerWidth;
    h = window.innerHeight - 60;
    canvas.size(w, h);
    location.reload(true)
}