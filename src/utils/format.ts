export const formatRawDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr || dateStr === 'N/A' || dateStr === '-') return dateStr || '-';
    try {
        // Handle ISO strings with T or space-separated strings
        const parts = dateStr.includes('T') ? dateStr.split('T') : dateStr.split(' ');
        if (parts.length >= 2) {
            const date = parts[0];
            const time = parts[1].slice(0, 5); // Take HH:mm
            return `${date} • ${time}`;
        }
        // If it's just a date without time
        return dateStr;
    } catch {
        return dateStr;
    }
};
