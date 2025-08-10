import React from 'react';
import styles from '../../styles/settings-dashboard/navbar.module.css';

interface NavItem {
  id: string;
  label: string;
}

interface StickyNavBarProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

const StickyNavBar: React.FC<StickyNavBarProps> = ({
  items,
  activeItem,
  onItemClick
}) => {
  return (
    <nav className={styles.stickyNav}>
      <ul className={styles.navList}>
        {items.map((item) => (
          <li key={item.id} className={styles.navItem}>
            <button
              className={`${styles.navButton} ${activeItem === item.id ? styles.active : ''}`}
              onClick={() => onItemClick(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default StickyNavBar;