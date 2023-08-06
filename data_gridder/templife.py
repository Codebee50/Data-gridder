import os
import sys
import time
from django_cron import CronJobBase, Schedule

class TempCron(CronJobBase):
    RUN_EVERY_MINS = 1

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'temp_life.temp_life_cron'
    
    def do(self):
        print('..parsing temp files')
        """os.listdirs is used to get a list of all files and directories in the specified directory"""
        temp_dir = 'media/temps'
        current_time = time.time()
        for filename in os.listdir(temp_dir):
            print(f"scanning {filename}")
            filepath = os.path.join(temp_dir, filename)
            if os.path.isfile(filepath):
                file_modified_time = os.path.getmtime(filepath)
                if current_time - file_modified_time >1 * 12 * 60 * 60: #changing hours into seconds since the current_time and file_modified_time are in seconds
                    os.remove(filepath)
                    print(f"Deleted tempfile: {filepath}")

    # if __name__ == '__main__':
    #     delete_temps()