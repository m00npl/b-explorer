import moment from 'moment';

export const formatTime = (timestamp: string): string => {
  return moment(timestamp).format('MMM DD, YYYY HH:mm:ss');
};

export const formatTimeAgo = (timestamp: string): string => {
  return moment(timestamp).fromNow();
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatBalance = (balance: number): string => {
  const eth = balance / 1e9;
  return `${eth.toFixed(4)} ETH`;
};

export const formatEffectiveness = (rating: number | null): string => {
  if (rating === null) return 'N/A';
  return `${(rating * 100).toFixed(2)}%`;
};

export const formatSlotStatus = (status: string): {
  label: string;
  className: string;
} => {
  switch (status) {
    case 'proposed':
      return { label: 'Proposed', className: 'status-active' };
    case 'missed':
      return { label: 'Missed', className: 'status-missed' };
    default:
      return { label: status, className: 'status-inactive' };
  }
};

export const formatValidatorStatus = (status: string): {
  label: string;
  className: string;
} => {
  switch (status) {
    case 'active_ongoing':
      return { label: 'Active', className: 'status-active' };
    case 'active_exiting':
      return { label: 'Exiting', className: 'bg-yellow-100 text-yellow-800' };
    case 'active_slashed':
      return { label: 'Slashed', className: 'status-missed' };
    case 'pending_initialized':
    case 'pending_queued':
      return { label: 'Pending', className: 'bg-blue-100 text-blue-800' };
    case 'withdrawal_possible':
    case 'withdrawal_done':
      return { label: 'Withdrawn', className: 'status-inactive' };
    default:
      return { label: status, className: 'status-inactive' };
  }
};

export const truncateHash = (hash: string, start: number = 8, end: number = 8): string => {
  if (!hash) return '';
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};