#imports
import haversine as hs
import pandas as pd
import numpy as np
import random
import time
from concurrent import futures
import grpc
import databroker_pb2_grpc
import databroker_pb2

port = 8061

class Databroker(databroker_pb2_grpc.DatabrokerServicer):

    def __init__(self):
        self.current_row = 0

        #load required datasets
        self.no2_data = pd.read_csv('./data/no2_testset.csv')
        self.pm10_data = pd.read_csv('./data/pm10_testset.csv')
        self.pm25_data = pd.read_csv('./data/pm25_testset.csv')
        self.gps_data = pd.read_csv('./data/sensor_gps.csv')
        self.sensor_gps = pd.read_csv('./data/low_cost_sensors.csv')


    def get_next(self, request, context):
        response = databroker_pb2.Features()
        if self.current_row >= self.no2_data.shape[0]:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("all data has been processed")
        else:
            #load 1 row from each dataset and convert to numpy
            # create response format dataframe
            no2 = pd.DataFrame(data=None, columns=self.no2_data.columns)
            pm10 = pd.DataFrame(data=None, columns=self.pm10_data.columns)
            pm25 = pd.DataFrame(data=None, columns=self.pm25_data.columns)
            for sensor in range(self.sensor_gps.shape[0]):
                id = self.sensor_gps.deviceID[sensor]
                counter=1
                for i in range(23,0,-1):        
                    lat1 = np.rad2deg(self.sensor_gps.iloc[sensor,4])
                    lon1 = np.rad2deg(self.sensor_gps.iloc[sensor,5])
                    lat2 = self.gps_data.iloc[0,i*2+1]
                    lon2 = self.gps_data.iloc[0,i*2]
                    distance = hs.haversine((lat2, lon2), (lat1, lon1))
                    self.no2_data.iloc[self.current_row,counter] = distance
                    self.pm10_data.iloc[self.current_row,counter] = distance
                    self.pm25_data.iloc[self.current_row,counter] = distance        
                    counter +=1
                
                no2 = no2.append(self.no2_data.iloc[self.current_row,:])
                pm10 = pm10.append(self.pm10_data.iloc[self.current_row,:])
                pm25 = pm25.append(self.pm25_data.iloc[self.current_row,:])

                no2_input= no2.iloc[:,1:].to_numpy()
                pm10_input= pm10.iloc[:,1:].to_numpy()
                pm25_input= pm25.iloc[:,1:].to_numpy()

                no2_input = np.ndarray.tobytes(no2_input)
                pm10_input = np.ndarray.tobytes(pm10_input)
                pm25_input = np.ndarray.tobytes(pm25_input)

                #add output to response
                response.no2_data = no2_input
                response.pm10_data = pm10_input
                response.pm25_data = pm25_input
            
            #add 1 to row counter(maybe we could make it cyclical with mod later)
            self.current_row += 1

        return response



#host server
server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
databroker_pb2_grpc.add_DatabrokerServicer_to_server(Databroker(), server)
print("Starting server. Listening on port : " + str(port))
server.add_insecure_port("[::]:{}".format(port))
server.start()

try:
    while True:
        time.sleep(86400)
except KeyboardInterrupt:
    server.stop(0)


