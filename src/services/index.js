// src/services/index.js - Update existing atau buat baru
export { default as api } from './api';
export { default as suratPengantarService } from './suratPengantarService';
export { default as kartuKeluargaService } from './kartuKeluargaService';
export { default as locationService } from './locationService';

// src/hooks/index.js - Update existing atau buat baru
export { useSuratPengantar } from './useSuratPengantar';
export { useKartuKeluarga } from './useKartuKeluarga';

// src/pages/kartuKeluarga/index.js - Buat baru
export { MyFamily, KKValidationForm } from './MyFamily';

// src/components/kartuKeluarga/index.js - Buat baru jika ada komponen khusus
// export komponen-komponen kartu keluarga lainnya

// Contoh penggunaan di App.js atau routes:
/*
import { MyFamily } from './pages/kartuKeluarga';
import { useKartuKeluarga } from './hooks';
import { kartuKeluargaService } from './services';

// Di component:
const { familyData, validateKK } = useKartuKeluarga();

// Atau direct service call:
const result = await kartuKeluargaService.getMyFamily();
*/