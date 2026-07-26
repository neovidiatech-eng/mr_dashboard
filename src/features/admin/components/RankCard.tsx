import { RankItem } from "../../../types/rank";

export const RankCard = ({ rank }: { rank: RankItem }) => {
  return (
    <div 
      style={{ 
        border: `2px solid ${rank.color}`,
        padding: '16px', 
        borderRadius: '8px',
        margin: '10px',
        width: '200px'
      }}
    >
      <h3 style={{ color: rank.color }}>{rank.name}</h3>
      <p>Age Range: {rank.ageRange.minAge} - {rank.ageRange.maxAge}</p>
      <small>Created At: {new Date(rank.createdAt).toLocaleDateString()}</small>
    </div>
  );
};