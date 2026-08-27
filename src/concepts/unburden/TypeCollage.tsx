import type { CSSProperties } from 'react';
import creditCard from './credit-card.png';
import medical from './medical.png';
import personalLoans from './personal-loans.png';
import student from './student.png';
import styles from './typeCollage.module.css';

interface Item {
  id: string;
  src: string;
  rest: { x: string; y: string; rotate: string; z: number };
  park: { x: string; y: string; rotate: string };
}

const ITEMS: Item[] = [
  {
    id: 'personal-loans',
    src: personalLoans,
    rest: { x: '-16%', y: '-14%', rotate: '-12deg', z: 2 },
    park: { x: '-28%', y: '-24%', rotate: '-16deg' },
  },
  {
    id: 'credit-card',
    src: creditCard,
    rest: { x: '18%', y: '-12%', rotate: '10deg', z: 3 },
    park: { x: '30%', y: '-22%', rotate: '14deg' },
  },
  {
    id: 'medical',
    src: medical,
    rest: { x: '-14%', y: '16%', rotate: '7deg', z: 1 },
    park: { x: '-26%', y: '26%', rotate: '11deg' },
  },
  {
    id: 'student',
    src: student,
    rest: { x: '16%', y: '14%', rotate: '-8deg', z: 4 },
    park: { x: '28%', y: '24%', rotate: '-12deg' },
  },
];

export function TypeCollage({ activeId }: { activeId: string | null }) {
  return (
    <div
      className={styles.collage}
      data-active={activeId || undefined}
    >
      {ITEMS.map((item) => {
        const pose =
          !activeId ? 'rest' : item.id === activeId ? 'spot' : 'park';
        return (
          <div
            key={item.id}
            className={styles.item}
            data-id={item.id}
            data-pose={pose}
            style={
              {
                '--rest-x': item.rest.x,
                '--rest-y': item.rest.y,
                '--rest-r': item.rest.rotate,
                '--park-x': item.park.x,
                '--park-y': item.park.y,
                '--park-r': item.park.rotate,
                zIndex: pose === 'spot' ? 6 : item.rest.z,
              } as CSSProperties
            }
          >
            <img
              className={styles.figure}
              src={item.src}
              alt=""
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
