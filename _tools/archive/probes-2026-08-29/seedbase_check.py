xs = [[2.0,3.0,-1.0],[3.0,-1.0,0.5],[0.5,1.0,1.0],[1.0,1.0,-1.0]]
ys = [1.0,-1.0,-1.0,1.0]
def train(zero_grads, seed, steps=60, lr=0.1):
    random.seed(seed)
    net = MLP(3,[4,4,1])
    for _ in range(steps):
        loss = sum(((net(x)-y)**2 for x,y in zip(xs,ys)), Value(0.0))
        if zero_grads:
            for p in net.parameters(): p.grad = 0.0
        loss.backward()
        for p in net.parameters(): p.data -= lr*p.grad
    return sum(((net(x)-y)**2 for x,y in zip(xs,ys)), Value(0.0)).data

for base in (50000, 999000):
    fails = 0
    for off in range(10):
        lo = base + off
        z = sum(1 for s in range(lo, lo+16) if train(True, s) < 0.5)
        l = sum(1 for s in range(lo, lo+16) if train(False, s) < 0.5)
        if not (z > l): fails += 1
    print(f"base={base}: fails={fails}/10 (Nancy claimed 0/10)")
