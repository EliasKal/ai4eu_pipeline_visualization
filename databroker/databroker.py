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

#load required datasets
no2_data = pd.read_csv('./data/no2_testset.csv')
pm10_data = pd.read_csv('./data/pm10_testset.csv')
pm25_data = pd.read_csv('./data/pm25_testset.csv')
gps_data = pd.read_csv('./data/sensor_gps.csv')
sensor_gps = pd.read_csv('./data/low_cost_sensors.csv')

#keep only the columns we need
gps_data = gps_data.iloc[:,1:49]

#get a random row as next value
row = random.randint(0, no2_data.shape[0])

#calculate and add distances to datasets
for i in range(gps_data.shape[1]//2):
    lat2 = gps_data.iloc[0,i*2+0]
    lon2 = gps_data.iloc[0,i*2+1]
    lat1 = sensor_gps.iloc[i,4]
    lon1 = sensor_gps.iloc[i,5]
    distance = hs.haversine((lat1, lon1), (lat2, lon2))
    no2_data.iloc[0,1+i] = distance
    pm10_data.iloc[0,1+i] = distance
    pm25_data.iloc[0,1+i] = distance


#databroker class
class Databroker(databroker_pb2_grpc.DatabrokerServicer):

    def __init__(self):
        self.current_row = 0

    def get_next(self, request, context):
        response = databroker_pb2.Features()
        if self.current_row >= no2_data.shape[0]:
            context.set_code(grpc.StatusCode.NOT_FOUND)
            context.set_details("all data has been processed")
        else:
            #load 1 row from each dataset and convert to numpy
            no2_input= no2_data.iloc[self.current_row,1:].to_numpy()
            pm10_input= pm10_data.iloc[self.current_row,1:].to_numpy()
            pm25_input= pm25_data.iloc[self.current_row,1:].to_numpy()

            #convert output to byte code(due to many columns per dataset)
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


