// src/components/leaderboard/LeaderboardTable.jsx
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import LeaderboardRow from './LeaderboardRow';

const EASE = [0.22, 1, 0.36, 1];

export default function LeaderboardTable({
  rows,
  lastEvents,
  figures = [],
  collectionId,
  totalFiguresAll = 0,
}) {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-3xl bg-white border border-[#F0E4D2] overflow-hidden
                 shadow-[0_24px_60px_-32px_rgba(120,60,0,0.35)]"
    >
      <div className="divide-y divide-[#F5EBD8]">
        {rows.map((row, i) => (
          <LeaderboardRow
            key={row.id}
            row={row}
            rank={i + 1}
            isMe={row.login === user?.login}
            lastEvent={lastEvents?.[row.id]}
            figures={figures}
            collectionId={collectionId}
            totalFiguresAll={totalFiguresAll}
          />
        ))}
      </div>
    </motion.div>
  );
}