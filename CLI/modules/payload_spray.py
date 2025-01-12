class PayloadSpray:
    def __init__(self, args, payload, targets):
        self.args = args
        self.payload = payload
        self.targets = targets

    def run(self):
        for target in self.targets:
            self.payload.run(target, self.args)