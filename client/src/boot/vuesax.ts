import { defineBoot } from '#q-app';
import Vuesax from 'vuesax-alpha';
import 'vuesax-alpha/dist/index.css';

export default defineBoot(({ app }) => {
  app.use(Vuesax);
});
