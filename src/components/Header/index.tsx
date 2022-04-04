import Link from 'next/link';
import header from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={header.container}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
