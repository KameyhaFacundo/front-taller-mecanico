import LegalLayout from '../../components/legal/LegalLayout'
import LegalSection from '../../components/legal/LegalSection'

// Contenido de referencia, redactado para este producto puntual — no
// reemplaza la revisión de un abogado antes de publicarse. Completar el
// contacto y la jurisdicción reales antes de salir a producción.
const CONTACTO = '[completar: email de contacto legal]'
const JURISDICCION = '[completar: jurisdicción / tribunales competentes]'

export default function Terminos() {
  return (
    <LegalLayout titulo="Términos y condiciones" actualizado="21 de agosto de 2026">
      <LegalSection titulo="1. Aceptación de los términos">
        <p>
          Estos Términos y Condiciones regulan el uso de Gestión de Talleres (el "Servicio"), una plataforma de gestión para
          talleres de reparación de vehículos que incluye, entre otras funciones, administración de clientes, vehículos,
          turnos, órdenes de trabajo, stock y caja, y una página pública de reservas para cada taller.
        </p>
        <p>
          Al crear una cuenta o utilizar el Servicio, quien lo hace en representación de un taller (el "Taller" o el
          "Usuario") acepta estos términos en su totalidad. Si no está de acuerdo, no debe utilizar el Servicio.
        </p>
      </LegalSection>

      <LegalSection titulo="2. Quién puede usar el Servicio">
        <p>
          El Servicio está destinado a talleres y a las personas que trabajan en ellos (administradores y empleados). Cada
          cuenta de usuario pertenece a una o más membresías de taller, con un rol (administrador o empleado) que determina
          qué acciones puede realizar dentro de ese taller.
        </p>
        <p>
          El Taller es responsable de mantener la confidencialidad de las credenciales de acceso de sus usuarios y de toda
          actividad que ocurra bajo su cuenta.
        </p>
      </LegalSection>

      <LegalSection titulo="3. Datos cargados por el Taller">
        <p>
          El Taller es responsable de los datos que carga en el Servicio: información de sus propios clientes, vehículos,
          turnos, órdenes de trabajo, stock, compras y movimientos de caja. El Taller garantiza que cuenta con las bases
          legales necesarias (por ejemplo, el consentimiento de sus clientes) para cargar y procesar esos datos en la
          plataforma.
        </p>
        <p>
          Gestión de Talleres actúa como proveedor de la infraestructura técnica sobre la que el Taller administra esos
          datos, no como titular de los datos de los clientes de cada taller.
        </p>
      </LegalSection>

      <LegalSection titulo="4. Uso aceptable">
        <p>El Usuario se compromete a no utilizar el Servicio para:</p>
        <ul>
          <li>Cargar datos falsos, engañosos o de terceros sin autorización para hacerlo.</li>
          <li>Intentar acceder a información de otro taller sin pertenecer a él.</li>
          <li>Interferir con el funcionamiento normal del Servicio o intentar vulnerar sus medidas de seguridad.</li>
          <li>Usar el envío de mensajes por WhatsApp integrado en el Servicio para spam o comunicaciones no solicitadas.</li>
        </ul>
      </LegalSection>

      <LegalSection titulo="5. Reservas online y página pública del Taller">
        <p>
          Cada Taller cuenta con una página pública donde sus clientes pueden solicitar turnos sin necesidad de crear una
          cuenta. El Taller es responsable de mantener actualizada la información que se muestra en esa página (datos de
          contacto, horarios, servicios ofrecidos).
        </p>
        <p>
          Una solicitud de turno realizada desde la página pública queda registrada como pendiente hasta que el Taller la
          confirme; el Servicio no garantiza la disponibilidad de un horario hasta esa confirmación.
        </p>
      </LegalSection>

      <LegalSection titulo="6. Disponibilidad del Servicio">
        <p>
          Se procura mantener el Servicio disponible de forma continua, pero puede haber interrupciones por mantenimiento,
          actualizaciones o causas fuera de nuestro control. No se garantiza disponibilidad ininterrumpida ni libre de
          errores.
        </p>
      </LegalSection>

      <LegalSection titulo="7. Cancelación">
        <p>
          El Taller puede dejar de usar el Servicio en cualquier momento. Podemos suspender o cancelar una cuenta que
          incumpla estos términos, previo aviso cuando sea razonablemente posible, salvo en casos de uso indebido grave o
          riesgo para el Servicio o para terceros.
        </p>
      </LegalSection>

      <LegalSection titulo="8. Limitación de responsabilidad">
        <p>
          El Servicio se ofrece "tal cual". En la medida permitida por la ley aplicable, no se garantiza que esté libre de
          errores ni se responde por daños indirectos derivados de su uso. El Taller es responsable de mantener sus propias
          copias de respaldo de la información crítica de su negocio cuando lo considere necesario.
        </p>
      </LegalSection>

      <LegalSection titulo="9. Modificaciones a estos términos">
        <p>
          Estos términos pueden actualizarse. Los cambios relevantes se comunicarán a través del Servicio o por el correo
          electrónico registrado. El uso continuado del Servicio después de una actualización implica la aceptación de los
          nuevos términos.
        </p>
      </LegalSection>

      <LegalSection titulo="10. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Ante cualquier controversia, las partes se
          someten a la jurisdicción de {JURISDICCION}.
        </p>
      </LegalSection>

      <LegalSection titulo="11. Contacto">
        <p>Para consultas sobre estos términos, escribí a {CONTACTO}.</p>
      </LegalSection>
    </LegalLayout>
  )
}
