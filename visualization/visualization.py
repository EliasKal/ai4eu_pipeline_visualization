#imports
import grpc 
from concurrent import futures
import time
import visualization_pb2
import visualization_pb2_grpc
import csv
import os
from app import app
import numpy as np
import pandas as pd
import time

port = 8063


class Visualization(visualization_pb2_grpc.VisualizationServicer):

    def __init__(self):
        pass
        self.df = pd.DataFrame(columns=['timestamp','NO2', 'PM10', 'PM2.5','deviceID'])
        self.sensor_gps = pd.read_csv('./app/static/data/low_cost_sensors.csv')
    

    def get_next(self, request, context):
        response = visualization_pb2.Empty()
        data = request.results
        dataframe = np.frombuffer(data).reshape(24,3)
        timestamp = np.full((24,1), int(time.time()*1000.0))

        data = np.concatenate((timestamp, dataframe, self.sensor_gps.deviceID.to_numpy()[:,None]),axis=1)
        self.df = self.df.append(pd.DataFrame(data,columns=['timestamp','NO2', 'PM10', 'PM2.5', 'deviceID']), ignore_index=True)

        self.df.to_csv("./app/static/data/results.csv")

        
        return response


#delete results file if it exists so the data capture restarts
if os.path.exists('./app/static/data/results.csv'):
    os.remove('./app/static/data/results.csv')
       

#host server
server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
visualization_pb2_grpc.add_VisualizationServicer_to_server(Visualization(), server)
print("Starting server. Listening on port : " + str(port))
server.add_insecure_port("[::]:{}".format(port))
server.start()
app.run()

try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)