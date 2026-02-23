class ResourceOwner:
    def __init__(self, user_agent) -> None:
        self.userAgent = user_agent
    def reqResource(self):
        return self.userAgent.getResource()

class UserAgent:
    def __init__(self, client) -> None:
        self.client = client
    def getResource(self):
        pass

class Client:
    pass

class AuthorizationServe:
    pass

class ResourceServer:
    def getResource(self, token):
        if token == "TOKEN-1234":
            return "YOU ARE WORTHY"
        return "YOU ARE NOT WORTHY"

#TODO: ab 3. weitermachen das ist das umleiten zum authserver