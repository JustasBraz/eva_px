import os
from os import walk
import json
from flask import Flask, request, render_template, url_for, redirect
import time
from datetime import date
from werkzeug.utils import secure_filename
import shutil


app = Flask(__name__)
DEBUG=True

ALLOWED_EXTENSIONS = {'mp3'}

#########################
#   MAIN USER ROUTES    #
#########################

@app.route("/")
def fileFrontPage():
    #return "hello there"#render_template('fileform.html')
    return render_template('homepage.html')

@app.route("/upload")
def upload_page():
    #return "hello there"#render_template('fileform.html')
    return render_template('upload_page.html')

@app.route("/handleUpload", methods=['POST','GET'])
def handleFileUpload():
    print('\nFORM UPLOADING')
    print('req',request)
    print('files',request.files)


    if ('song' in request.files):
        song = request.files['song']
        if (song.filename != ''):      
            if song and allowed_file(song.filename):
                new_archive,archive_id=create_new_archive()
                if(create_json_file(request,new_archive,archive_id)):
                    song.save(os.path.join(new_archive, 'archive_'+archive_id+'.mp3'))
                    print('saved', new_archive)
                else:
                    shutil.rmtree(new_archive)
                    print('removed', new_archive)


#app.config['UPLOAD_FOLDER']

    
    
    #non-mandatory




    print('FORM UPLOADING\n')




   
    return redirect(url_for('fileFrontPage'))

########################
#   MAIN API ROUTES    #
########################

@app.route("/backlog")
def backlog_route():
    my_path='./static/files/'

    dir_list = []
    for (dirpath, dirnames, filenames) in walk(my_path):
        dir_list.extend(dirnames)
        break
    print("pre-sorted",dir_list)
    dir_list.sort()
    print("sorted",dir_list)

    data=[]

    for dirs in dir_list:
        try:
            filename=dirs+'.json'
            file_dir=my_path+dirs+'/'+filename
            with open(file_dir) as json_file:
                loaded=json.load(json_file)
            data.append(loaded)
        except:
            print('missing data in ', dirs)

    response={'data':data}
    return json.dumps(response)


def create_new_archive():
    my_path='./static/files/'

    dir_list = []
    for (dirpath, dirnames, filenames) in walk(my_path):
        dir_list.extend(dirnames)
        break
    print("pre-sorted",dir_list)
    dir_list.sort(reverse=True)
    print("sorted",dir_list)

    #get the most recent id
    current_id=int(dir_list[0].replace('archive_',''))
    next_id=str(current_id+1)
    print("next_id",next_id)

    #define path
    path=my_path+'archive_'+str(next_id)
    try:
        os.mkdir(path)
        #print('uncommented mkdir')
    except OSError:
        print ("Creation of the directory %s failed" % path)
    else:
        print ("Successfully created the directory %s" % path)
    return path,next_id

#def fill_json():
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_json_file(request,new_archive,archive_id):
    today=date.today()
    d1 = today.strftime("%d-%m-%Y")
    try:
        new_dict={
            'title': request.args['title'],
            'description': request.args['description'],
            "location": request.args['location'],
        "archive_id":'archive_'+archive_id,
        "date": d1,
            'circle':{
                'category': request.args['category'],
                'frequency': request.args['frequency'],
                'KB_score': int(request.args['KB']),
                'AH_score': int(request.args['AH'])
                }
            }

        try:
            new_dict['mem_sentence_1']=request.args['mem_sentence_1']
            new_dict['mem_sentence_2']=request.args['mem_sentence_2']
            new_dict['mem_sentence_3']=request.args['mem_sentence_3']

        except:
            print('No memorable sentence')

        with open(new_archive+'/'+'archive_'+archive_id+'.json', 'w') as json_file:
            json.dump(new_dict, json_file)
        #mandatory
        print('Title', request.args['title'])
        print('description', request.args['description'])
        print('location', request.args['location'])

        print(new_dict)
        return True
    except:
        print('problem with data')
        return False



if __name__ == '__main__':
    print("Eva PX starting...")

    #app.run(host="127.0.0.1",port=5000,debug=DEBUG)
    app.run()

