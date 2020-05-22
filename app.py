import os
from os import walk
import json
from flask import Flask, request, render_template, url_for, redirect

app = Flask(__name__)
DEBUG=True


#########################
#   MAIN USER ROUTES    #
#########################

@app.route("/")
def fileFrontPage():
    #return "hello there"#render_template('fileform.html')
    return render_template('homepage.html')

@app.route("/handleUpload", methods=['POST'])
def handleFileUpload():
    if ('song' in request.files):
        song = request.files['song']
        if (song.filename != ''):       
            new_archive,archive_id=create_new_archive()
            song.save(os.path.join(new_archive, 'archive_'+archive_id))
    return redirect(url_for('fileFrontPage'))


########################
#   MAIN API ROUTES    #
########################

@app.route("/backlog")
def backlog_route():
    my_path='./files/'

    dir_list = []
    for (dirpath, dirnames, filenames) in walk(my_path):
        dir_list.extend(dirnames)
        break
    print("pre-sorted",dir_list)
    dir_list.sort()
    print("sorted",dir_list)

    data=[]

    for dirs in dir_list:
        filename=dirs+'.json'
        file_dir=my_path+dirs+'/'+filename
        with open(file_dir) as json_file:
            loaded=json.load(json_file)
        data.append(loaded)

    response={'data':data}
    return json.dumps(response)


def create_new_archive():
    my_path='./files/'

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
    except OSError:
        print ("Creation of the directory %s failed" % path)
    else:
        print ("Successfully created the directory %s" % path)
    return path,next_id

#def fill_json():




if __name__ == '__main__':
    print("Eva PX starting...")

    app.run(host="127.0.0.1",port=5000,debug=DEBUG)


