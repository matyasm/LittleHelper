// Create a new component for highlighting search terms in text
const SearchHighlight = ({ text, searchQuery, style }) => {
  if (!searchQuery || !text) return <span style={style}>{text}</span>;
  
  const query = searchQuery.toLowerCase();
  if (!text.toLowerCase().includes(query)) return <span style={style}>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <span style={style}>
      {parts.map((part, i) => 
        part.toLowerCase() === query 
          ? <mark key={i} style={{ backgroundColor: 'rgba(255, 255, 0, 0.3)', padding: 0 }}>{part}</mark> 
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default SearchHighlight; 