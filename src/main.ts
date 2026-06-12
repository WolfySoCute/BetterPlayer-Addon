import '@/styles/additionalContent.css';
import '@/styles/background.css';
import '@/styles/customControls.css';
import '@/styles/customControlsThemes.css';

import {logger} from '@/logger';
logger.info('Инициализация аддона...');
import {mountPlayer} from '@/player';

mountPlayer()