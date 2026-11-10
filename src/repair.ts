import gsap from 'gsap';

type Point = [x: number, y: number];

const ease = gsap.parseEase('power2.inOut');
const limit = (value: number) => Math.max(0, Math.min(1, value));
const at = (p: number, start: number, end: number) => limit((p - start) / (end - start));
const mix = (a: Point, b: Point, p: number): Point => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];

const team = [
  { name: 'Patch', color: '#7fd6f8' },
  { name: 'Fetch', color: '#ffc06c' },
  { name: 'Set', color: '#91e2bb' },
];

const fragments = [
  { x: -.49, y: .13, angle: -9, start: .422, end: .522 },
  { x: .14, y: -.13, angle: 6, start: .535, end: .632 },
  { x: .51, y: .14, angle: 9, start: .645, end: .755 },
];

function pathAt(points: Point[], progress: number): Point {
  const lengths = points.slice(1).map((point, i) => Math.hypot(point[0] - points[i][0], point[1] - points[i][1]));
  let remaining = limit(progress) * lengths.reduce((total, length) => total + length, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i]) return mix(points[i], points[i + 1], remaining / (lengths[i] || 1));
    remaining -= lengths[i];
  }
  return points[points.length - 1];
}

function trace(ctx: CanvasRenderingContext2D, path: Point[], progress: number) {
  ctx.beginPath();
  ctx.moveTo(...path[0]);
  for (let i = 1; i <= 50; i++) ctx.lineTo(...pathAt(path, progress * i / 50));
  ctx.stroke();
}

function arrow(ctx: CanvasRenderingContext2D, [x, y]: Point, index: number, boardWidth: number) {
  const { name, color } = team[index];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#141619';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(19, 10);
  ctx.lineTo(11.6, 12.3);
  ctx.lineTo(9.4, 19);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 10px ui-monospace, monospace';
  const tagWidth = Math.ceil(ctx.measureText(name).width) + 12;
  const left = x + 20 + tagWidth > boardWidth - 3 ? -tagWidth - 2 : 15;
  ctx.fillRect(left, 15, tagWidth, 19);
  ctx.fillStyle = '#161819';
  ctx.fillText(name, left + 6, 28);
  ctx.restore();
}

export function paintRepair(board: HTMLDivElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const target = board.querySelector<HTMLElement>('.photo-target')!;
  const tiles = Array.from(target.querySelectorAll<HTMLElement>('.piece'));
  let width = 0;
  let height = 0;
  let ratio = 1;
  let box = { x: 0, y: 0, w: 0, h: 0 };

  return (p: number, still: boolean) => {
    const route = p >= .343;
    const frame = p >= .782;
    const log = p >= .933;
    const scene = p >= .8 ? 3 : p >= .37 ? 2 : p >= .15 ? 1 : 0;
    const progress = Math.round(p * 100);
    board.style.setProperty('--unified', String(at(p, .75, .782)));
    board.style.setProperty('--developed', String(at(p, .755, .8)));
    board.style.setProperty('--lift', String(1 - ease(at(p, 0, .15))));
    board.style.setProperty('--trace', String(at(p, .37, .53) * (1 - at(p, .775, .82))));

    const nextWidth = board.clientWidth;
    const nextHeight = board.clientHeight;
    const nextRatio = Math.min(window.devicePixelRatio || 1, 2);
    if (nextWidth !== width || nextHeight !== height || nextRatio !== ratio) {
      width = nextWidth;
      height = nextHeight;
      ratio = nextRatio;
      box = { x: target.offsetLeft, y: target.offsetTop, w: target.offsetWidth, h: target.offsetHeight };
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }

    const tileWidth = box.w / 3;
    const inset = Math.min(26, width * .043);
    const circuit: Point[] = [[inset, height * .3], [inset * 1.9, height * .3], [inset * 1.9, height * .53], [inset * .75, height * .53], [inset * .75, height * .73], [inset * 2.35, height * .73]];
    const perimeter: Point[] = [[box.x, box.y], [box.x + box.w, box.y], [box.x + box.w, box.y + box.h], [box.x, box.y + box.h], [box.x, box.y]];
    const entry: Point[] = [[width * .28, height * .22], [width * .69, height * .22], [width * .68, height * .76]];
    const waiting: Point[] = [[width * .19, height * .32], [width * .78, height * .31], [width * .62, height * .67]];
    const docks: Point[] = [[width * .22, height - 61], [width * .48, height - 61], [width * .73, height - 61]];

    function fragmentPosition(index: number, time: number): Point {
      const part = fragments[index];
      const remaining = 1 - ease(at(time, part.start, part.end));
      return [box.x + tileWidth * (index + .55 + part.x * remaining), box.y + box.h * (.63 + part.y * remaining)];
    }

    function recoveryPosition(index: number, time: number): Point {
      if (index === 0) return pathAt(perimeter, ease(at(time, .37, .74)));
      const pieceIndex = time >= fragments[1].end ? 2 : time >= fragments[0].end ? 1 : 0;
      const carry = fragmentPosition(pieceIndex, time);
      const offset: Point = index === 1 ? [0, -12] : [tileWidth * .22, 31];
      const arrive = (position: Point): Point => [position[0] + offset[0], position[1] + offset[1]];
      const previous = pieceIndex ? fragments[pieceIndex - 1].end : .37;
      if (time < fragments[pieceIndex].start + .014) {
        const earlier = pieceIndex ? arrive(fragmentPosition(pieceIndex - 1, previous)) : waiting[index];
        return mix(earlier, arrive(carry), ease(at(time, previous, fragments[pieceIndex].start + .014)));
      }
      return arrive(carry);
    }

    function cursorPosition(index: number, time: number): Point {
      if (time < .15) return mix(entry[index], waiting[index], ease(at(time, 0, .15)));
      if (time < .37) {
        const leave = at(time, .337, .37);
        const to: Point = index === 0 ? perimeter[0] : waiting[index];
        let point: Point;
        if (index === 0) point = mix(waiting[0], pathAt(circuit, ease(at(time, .199, .337))), ease(at(time, .15, .21)));
        else if (index === 1) point = mix(waiting[1], circuit[circuit.length - 1], ease(at(time, .185, .335)));
        else point = mix(waiting[2], [circuit[circuit.length - 1][0] + 36, height * .81], ease(at(time, .18, .335)));
        return mix(point, to, ease(leave));
      }
      if (time < .79) return recoveryPosition(index, time);
      const home = recoveryPosition(index, .789);
      const rest = docks[index];
      if (index === 1 && time > .84 && time < .96) {
        const logLine: Point = [width * .27, height - 42];
        return time < .922 ? mix(rest, logLine, ease(at(time, .84, .922))) : mix(logLine, rest, ease(at(time, .922, .96)));
      }
      return mix(home, rest, ease(at(time, .79, .84)));
    }

    tiles.forEach((tile, index) => {
      const part = fragments[index];
      const remaining = 1 - ease(at(p, part.start, part.end));
      tile.style.transform = `translate(${part.x * remaining * 100}%, ${part.y * remaining * 100}%) rotate(${part.angle * remaining}deg)`;
    });

    if (ctx) {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!still) {
        const routeOpacity = at(p, .163, .207) * (1 - at(p, .363, .42));
        if (routeOpacity > 0) {
          ctx.globalAlpha = routeOpacity * .58;
          ctx.strokeStyle = '#82908d';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          trace(ctx, circuit, 1);
          ctx.setLineDash([]);
          ctx.globalAlpha = routeOpacity;
          ctx.strokeStyle = team[0].color;
          ctx.lineWidth = 2;
          trace(ctx, circuit, ease(at(p, .199, .337)));
        }

        const traceProgress = ease(at(p, .37, .74));
        if (traceProgress > 0 && p < .82) {
          ctx.globalAlpha = 1 - at(p, .77, .82);
          ctx.strokeStyle = team[0].color;
          ctx.lineWidth = 1;
          trace(ctx, perimeter, traceProgress);
        }

        if (p > .749 && p < .817) {
          ctx.globalAlpha = Math.sin(at(p, .749, .817) * Math.PI) * .85;
          ctx.strokeStyle = '#ff7943';
          ctx.lineWidth = 2;
          const pad = 6 + 18 * at(p, .749, .817);
          ctx.strokeRect(box.x - pad, box.y - pad, box.w + pad * 2, box.h + pad * 2);
        }

        team.forEach(({ color }, index) => {
          ctx.globalAlpha = .4 * (1 - at(p, .81, .86));
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(...cursorPosition(index, Math.max(0, p - .026)));
          for (let i = 1; i <= 8; i++) ctx.lineTo(...cursorPosition(index, Math.max(0, p - .026 + i * .026 / 8)));
          ctx.stroke();
          ctx.globalAlpha = 1;
          const position = cursorPosition(index, p);
          if (index === 1 && p > .188 && p < .343) {
            const [x, y] = position;
            ctx.fillStyle = '#21282a';
            ctx.strokeStyle = team[1].color;
            ctx.lineWidth = 1;
            ctx.fillRect(x - 20, y - 3, 19, 11);
            ctx.strokeRect(x - 20, y - 3, 19, 11);
            ctx.fillStyle = team[1].color;
            ctx.fillRect(x - 24, y, 4, 2);
            ctx.fillRect(x - 24, y + 4, 4, 2);
          }
          if (index === 1 && p > .86 && p < .933) {
            const [x, y] = position;
            ctx.fillStyle = '#252b2d';
            ctx.strokeStyle = team[1].color;
            ctx.lineWidth = 1;
            ctx.fillRect(x - 50, y - 6, 48, 15);
            ctx.strokeRect(x - 50, y - 6, 48, 15);
            ctx.fillStyle = team[1].color;
            ctx.fillRect(x - 44, y - 1, 31, 1);
            ctx.fillRect(x - 44, y + 4, 21, 1);
          }
          arrow(ctx, position, index, width);
        });
      }
    }

    return { scene, progress, route, frame, log };
  };
}
