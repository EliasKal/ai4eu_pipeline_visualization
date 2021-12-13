import grpc
import logging

# import the generated classes
import databroker_pb2
import databroker_pb2_grpc

port = 8061


def run():
    logging.basicConfig()
    print("Calling HPP_Stub..")
    with grpc.insecure_channel('localhost:{}'.format(port)) as channel:
        stub = databroker_pb2_grpc.DatabrokerStub(channel)
        ui_request = databroker_pb2.Features()
                                        
        response = stub.get_next(ui_request)

    print("Greeter client received: ")
    print(response)
    print('Done!')
    return print(response.no2_data)


if __name__ == '__main__':
    run()
