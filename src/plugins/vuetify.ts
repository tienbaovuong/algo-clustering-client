// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDataTable, VDataTableServer } from 'vuetify/labs/components'


const vuetify = createVuetify({
  components: {...components, VDataTable: VDataTable, VDataTableServer: VDataTableServer},
  directives,
})

export default vuetify;