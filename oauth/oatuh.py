class ResourceOwner:
    def __init__(self, user_agent) -> None:
        self.userAgent = user_agent
    def reqResource(self):
        print("Anfrage an UserAgent gesendet!")
        return self.userAgent.getResource()
    def eingabeAuth(self):
        pass
    def print_ausgabe(self):
        pass

class UserAgent:
    def __init__(self, client, auth_server) -> None:
        self.client = client
        self.authServer = auth_server
    def getResource(self):
        pass
    def getAuthReq(self):
        pass
    def anzeigeAuthGui(self):
        pass
    def postBesUndAuth(self):
        pass
    def auth_code(self):
        pass
    def anzeige_resource(self):
        pass

class Client:
    def __init__(self, user_agent, auth_server, resource_server) -> None:
        self.userAgent = user_agent
        self.authServer = auth_server
        self.resourceServer = resource_server
    def http_302_auth_req(self):
        pass
    def post_auth_code_redi_url(self):
        pass
    def get_resource_mit_access_token(self):
        pass
    def http_200_res(self):
        pass

class AuthorizationServe:
    def __init__(self, user_agent, client) -> None:
        self.userAgent = user_agent
        self.client = client
    def authGui(self):
        pass
    def http_302_auth_code(self):
        pass
    def acc_token_und_optional_refresh_token(self):
        pass

class ResourceServer:
    def __init__(self, client) -> None:
        self.client = client
    def htpp_200_resource(self, token):
        if token == "TOKEN-1234":
            return "YOU ARE WORTHY"
        return "YOU ARE NOT WORTHY"

#TODO: funktionen implemntieren