import grpc
import logging

# import the generated classes
import prediction_pb2
import prediction_pb2_grpc

port = 8061


def run():
    logging.basicConfig()
    print("Calling HPP_Stub..")
    with grpc.insecure_channel('localhost:{}'.format(port)) as channel:
        stub = prediction_pb2_grpc.PredictionStub(channel)
        ui_request = prediction_pb2.Features()
                                        
        response = stub.predict(ui_request)

    print("Greeter client received: ")
    print(response)
    print('Done!')


if __name__ == '__main__':
    run()