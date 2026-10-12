import { NavLink } from 'react-router-dom';
import { MODULES } from '../modules';

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-sep bg-bar/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto flex max-w-2xl">
        {MODULES.map(({ id, label, icon: Icon, path }) => (
          <li key={id} className="flex-1">
            <NavLink
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 pt-1.5 pb-1 text-[10px] font-medium ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              <Icon className="size-7" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
