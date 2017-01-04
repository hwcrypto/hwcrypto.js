import DigiDocPlugin from './DigiDocPlugin'
import DigiDocExtension from './DigiDocExtension'
import DigiDocServlet from './DigiDocServlet'

const enabledPlugins = [
	DigiDocServlet,
	DigiDocPlugin,
	DigiDocExtension
]

export { DigiDocPlugin, DigiDocExtension, DigiDocServlet, enabledPlugins }
