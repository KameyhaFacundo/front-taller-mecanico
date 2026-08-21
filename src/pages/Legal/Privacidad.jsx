import LegalLayout from '../../components/legal/LegalLayout'
import LegalSection from '../../components/legal/LegalSection'

// Contenido de referencia, redactado para este producto puntual — no
// reemplaza la revisión de un abogado antes de publicarse.
const CONTACTO = '381 506-9332 (Gestión de Taller)'

export default function Privacidad() {
  return (
    <LegalLayout titulo="Política de privacidad" actualizado="21 de agosto de 2026">
      <LegalSection titulo="1. Qué datos recopilamos">
        <p>Según cómo se use el Servicio, procesamos distintos tipos de datos:</p>
        <ul>
          <li>
            <strong>Datos de la cuenta:</strong> nombre, correo electrónico y contraseña (almacenada de forma encriptada) de
            quienes usan el panel.
          </li>
          <li>
            <strong>Datos del Taller:</strong> nombre del negocio, dirección, horario y número de WhatsApp que el Taller
            carga en su configuración para mostrarse en su página pública.
          </li>
          <li>
            <strong>Datos de clientes del Taller:</strong> nombre, teléfono, vehículos y turnos que el propio Taller carga
            para gestionar su negocio. Estos datos son responsabilidad del Taller que los ingresa — ver la sección "Datos
            cargados por el Taller" de los Términos y Condiciones.
          </li>
          <li>
            <strong>Datos de uso técnico:</strong> información básica de acceso (como la sesión activa) necesaria para el
            funcionamiento del Servicio.
          </li>
        </ul>
      </LegalSection>

      <LegalSection titulo="2. Para qué usamos los datos">
        <ul>
          <li>Brindar el Servicio: autenticación, gestión de turnos, órdenes, stock y caja.</li>
          <li>Mostrar la página pública de reservas de cada Taller a sus clientes.</li>
          <li>Enviar notificaciones operativas por WhatsApp cuando el Taller tiene esa integración activada.</li>
          <li>Detectar y prevenir uso indebido del Servicio.</li>
        </ul>
        <p>No vendemos datos personales a terceros.</p>
      </LegalSection>

      <LegalSection titulo="3. Con quién se comparten los datos">
        <p>Los datos pueden compartirse únicamente con:</p>
        <ul>
          <li>El proveedor de hosting/infraestructura donde corre el Servicio.</li>
          <li>Meta / WhatsApp Business API, solo para los talleres que activen esa integración, y solo con los datos necesarios para enviar y recibir esos mensajes.</li>
          <li>Autoridades competentes, cuando exista una obligación legal de hacerlo.</li>
        </ul>
      </LegalSection>

      <LegalSection titulo="4. Almacenamiento local en el navegador">
        <p>
          El Servicio guarda en el navegador (localStorage) la sesión activa (token de acceso), la preferencia de modo
          claro/oscuro y el taller activo, para no pedir estos datos en cada visita. Esta información no se comparte con
          terceros y se borra al cerrar sesión.
        </p>
      </LegalSection>

      <LegalSection titulo="5. Seguridad">
        <p>
          Los datos de cada Taller están aislados de los de los demás talleres dentro del sistema. Las contraseñas se
          almacenan encriptadas. El acceso a funciones administrativas está restringido según el rol de cada usuario dentro
          de su taller.
        </p>
      </LegalSection>

      <LegalSection titulo="6. Cuánto tiempo conservamos los datos">
        <p>
          Los datos se conservan mientras la cuenta del Taller esté activa. Si un Taller solicita la baja de su cuenta,
          sus datos se eliminan o anonimizan dentro de un plazo razonable, salvo que exista una obligación legal de
          conservarlos por más tiempo.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Derechos de las personas titulares de los datos">
        <p>
          De acuerdo con la Ley 25.326 de Protección de Datos Personales, toda persona tiene derecho a acceder, rectificar,
          actualizar o solicitar la eliminación de sus datos personales. Los clientes de un Taller que quieran ejercer
          estos derechos sobre sus propios datos deben dirigirse en primer lugar al Taller donde son clientes, ya que es
          quien administra esa información. Quienes usan el panel como usuarios de un Taller pueden hacerlo directamente
          desde su cuenta o escribiendo al {CONTACTO}.
        </p>
        <p>
          La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley 25.326, tiene la
          atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas
          sobre protección de datos personales.
        </p>
      </LegalSection>

      <LegalSection titulo="8. Menores de edad">
        <p>El Servicio está destinado a personas mayores de 18 años que administran o trabajan en un taller.</p>
      </LegalSection>

      <LegalSection titulo="9. Cambios a esta política">
        <p>
          Esta política puede actualizarse. Los cambios relevantes se comunicarán a través del Servicio o por el correo
          electrónico registrado.
        </p>
      </LegalSection>

      <LegalSection titulo="10. Contacto">
        <p>Para consultas sobre esta política de privacidad, escribinos al {CONTACTO}.</p>
      </LegalSection>
    </LegalLayout>
  )
}
