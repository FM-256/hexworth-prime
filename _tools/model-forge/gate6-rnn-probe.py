"""Gate 6 rests on ONE claim: an RNN's memory degrades with distance, and THAT is why
attention was invented. That is textbook conventional wisdom -- exactly the kind that
failed measurement twice in Gate 3. Measure it before writing a word.

Two questions, both blocking:
  (a) FEASIBILITY -- does a pure-Python RNN on the HexGrad Value engine train in a time
      a student will tolerate in Pyodide? If not, the whole gate design changes.
  (b) THE CLAIM -- does recall accuracy actually fall off with distance?

Task: sequence is [cue, filler, filler, ..., query] and the model must reproduce the
character that appeared at the cue. Distance = how far back the cue sits.
"""
import sys, time, random, math
sys.setrecursionlimit(100000)
exec(open('/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/77980b61-f845-464e-b03e-89593a796ebd/scratchpad/hexnet/sweep_defs.py').read())

VOCAB = 4           # tiny on purpose: keep it trainable in a browser
HID   = 8

def make_example(distance, rnd):
    """cue at position 0, then `distance` fillers. Target = the cue symbol."""
    cue = rnd.randrange(VOCAB)
    seq = [cue] + [rnd.randrange(VOCAB) for _ in range(distance)]
    return seq, cue

def onehot(i):
    return [Value(1.0 if j == i else 0.0) for j in range(VOCAB)]

class RNN:
    """h_t = tanh(W_xh x_t + W_hh h_{t-1} + b); output = W_hy h_T"""
    def __init__(self, rnd):
        r = lambda: Value(rnd.uniform(-0.5, 0.5))
        self.Wxh = [[r() for _ in range(VOCAB)] for _ in range(HID)]
        self.Whh = [[r() for _ in range(HID)]   for _ in range(HID)]
        self.b   = [r() for _ in range(HID)]
        self.Why = [[r() for _ in range(HID)]   for _ in range(VOCAB)]
    def parameters(self):
        ps = [p for row in self.Wxh for p in row] + [p for row in self.Whh for p in row]
        ps += self.b + [p for row in self.Why for p in row]
        return ps
    def __call__(self, seq):
        h = [Value(0.0) for _ in range(HID)]
        for tok in seq:
            x = onehot(tok)
            nh = []
            for i in range(HID):
                acc = self.b[i]
                for j in range(VOCAB): acc = acc + self.Wxh[i][j] * x[j]
                for j in range(HID):   acc = acc + self.Whh[i][j] * h[j]
                nh.append(acc.tanh())
            h = nh
        return [sum((self.Why[k][i] * h[i] for i in range(HID)), Value(0.0))
                for k in range(VOCAB)]

def train_and_score(distance, steps, seed, n_train=12, n_test=24):
    rnd = random.Random(seed)
    net = RNN(rnd)
    train = [make_example(distance, rnd) for _ in range(n_train)]
    lr = 0.3
    for _ in range(steps):
        loss = Value(0.0)
        for seq, tgt in train:
            out = net(seq)
            # squared error against a one-hot target -- keeps the engine simple
            for k in range(VOCAB):
                want = 1.0 if k == tgt else -1.0
                loss = loss + (out[k] - want) ** 2
        for p in net.parameters(): p.grad = 0.0
        loss.backward()
        for p in net.parameters(): p.data -= lr * p.grad / len(train)
    # accuracy on FRESH examples
    correct = 0
    for _ in range(n_test):
        seq, tgt = make_example(distance, rnd)
        out = net(seq)
        pred = max(range(VOCAB), key=lambda k: out[k].data)
        correct += (pred == tgt)
    return correct / n_test

print("(a) FEASIBILITY + (b) THE CLAIM -- accuracy vs distance (chance = 25%)")
print(f"{'distance':>8} {'accuracy':>9} {'seconds':>8}")
for dist in (1, 2, 4, 8):
    t0 = time.time()
    accs = [train_and_score(dist, steps=40, seed=s) for s in range(3)]
    dt = (time.time() - t0) / 3
    print(f"{dist:>8} {sum(accs)/len(accs):>8.0%} {dt:>8.1f}")
