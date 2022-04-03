import Logo from '../../../public/Logo.svg';

export default function Header(): JSX.Element {
  return (
    <header>
      <img src={Logo} alt="logo" />
    </header>
  );
}
