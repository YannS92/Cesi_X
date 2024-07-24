import { useParams } from 'react-router-dom';

function Language() {
  let { lang } = useParams();
  return <h1>langue de la page : {lang}</h1>;
}

export default Language;