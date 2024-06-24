// elevatorMachine.js
import { createMachine, assign } from 'xstate';

const elevatorMachine = createMachine({
  id: 'elevator',
  initial: 'idle',
  context: {
    currentY: 0,
    targetY: 0,
    direction: null, // 'up' or 'down'
    doorDelay: 2000, // 动态计算的延迟时间
    queue: [] // 目标楼层队列
  },
  states: {
    idle: {
      on: {
        MOVE: {
          target: 'moving',
          actions: ['setTargetAndDirection', 'addToQueue', 'sortQueue']
        },
        FLOOR_REQUEST: {
          actions: ['addToQueue', 'sortQueue', 'maybeMove']
        }
      }
    },
    moving: {
      on: {
        ARRIVE: {
          target: 'opening',
          actions: ['setCurrentY', 'sortQueue']
        }
      }
    },
    opening: {
      after: {
        DOOR_DELAY: 'open'
      },
      entry: 'logOpened'
    },
    open: {
      on: {
        CLOSE: 'closing'
      }
    },
    closing: {
      after: {
        DOOR_DELAY: [
          {
            target: 'idle',
            guard: 'isQueueEmpty',
            actions: 'clearDirection'
          },
          {
            target: 'moving',
            guard: 'isQueueNotEmpty',
            actions: 'setNextTarget'
          }
        ]
      }
    }
  }
}, {
  actions: {
    setTargetAndDirection: assign(({ context, event }) => {
      context.targetY = event.targetY;
      context.direction = event.targetY > context.currentY ? 'up' : 'down';
    }),
    setDoorDelay: assign(({ context, event }) => {
      context.doorDelay = event.doorDelay;
    }),
    logOpened: () => {
      console.log('Elevator door opened');
    },
    setCurrentY: assign((context) => {
      context.currentY = context.targetY;
    }),
    addToQueue: assign(({ context, event }) => {
      if (!context.queue.includes(event.targetY)) {
        context.queue.push(event.targetY);
      }
      console.log('queue', context.queue);
    }),
    clearDirection: assign(({ context, event }) => {
      context.direction = null;
    }),
    setNextTarget: assign(({ context, event }) => {
      if (context.queue.length > 0) {
        const nextTarget = context.queue.shift();
        context.targetY = nextTarget;
        context.direction = nextTarget > context.currentY ? 'up' : 'down';
      }
    }),
    sortQueue: assign(({ context, event }) => {
      context.queue.sort((a, b) => a - b);
    }),
    maybeMove: ({ context, event, self }) => {
      if (context.queue.length > 0) {
        self.ref.send({ type: 'MOVE', targetY: context.queue[0] });
      }
    }
  },
  guards: {
    isQueueEmpty: ({ context, event }) => context.queue.length === 0,
    isQueueNotEmpty: ({ context, event }) => context.queue.length > 0
  },
  delays: {
    DOOR_DELAY: ({ context, event }) => context.doorDelay
  }
});

export default elevatorMachine;
