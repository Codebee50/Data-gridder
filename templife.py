import os
import sys
import time


class TempCron():
    print('..parsing temp files')
    """os.listdirs is used to get a list of all files and directories in the specified directory"""
    
    temp_dir = 'media/temps'
    #temp_dir = settings.TEMP_DIR
    current_time = time.time()
    if os.path.exists(temp_dir):
        file_count = 0
        for filename in os.listdir(temp_dir):
            filepath = os.path.join(temp_dir, filename)
            if os.path.isfile(filepath):
                file_modified_time = os.path.getmtime(filepath)
                if current_time - file_modified_time >0 * 0 * 0 * 60: #changing hours into seconds since the current_time and file_modified_time are in seconds
                    os.remove(filepath)
                    file_count +=1
        print('successfully deleted' + str(file_count))
                   
    else:
        print("path not found") 

    # if __name__ == '__main__':
    #     delete_temps()