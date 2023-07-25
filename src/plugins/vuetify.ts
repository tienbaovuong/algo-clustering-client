// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDataTable, VDataTableServer, VDataTableVirtual } from 'vuetify/labs/VDataTable'

const vuetify = createVuetify({
  components: {...components, VDataTable: VDataTable, VDataTableServer: VDataTableServer, VDataTableVirtual: VDataTableVirtual},
  directives,
})

export default vuetify;