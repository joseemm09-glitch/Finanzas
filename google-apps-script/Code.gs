/**
 * INGESTA AUTOMÁTICA DE NÓMINA BANAMEX
 * Usuario: José Ramón Márquez Montes (joseemm09@gmail.com)
 * Cuenta: JOSE MARQUEZ Tarjeta ***194
 * Horario de Depósito: Miércoles a las 6:00 PM (18:00 hrs)
 */

const CONFIG = {
  ENDPOINT: "https://finanzas-ios.vercel.app/api/webhooks/banamex-payroll",
  SECRET: "banamex_sec_jm09_2026",
  QUERY: 'from:notificaciones@banamex.com "JOSE MARQUEZ" "194" "Depósito a cuenta o tarjeta" is:unread'
};

/**
 * Función principal: Busca correos no leídos de nómina Banamex y los envía a la PWA
 */
function syncBanamexPayroll() {
  Logger.log("Iniciando búsqueda de correos de nómina Banamex...");
  const threads = GmailApp.search(CONFIG.QUERY, 0, 5);
  
  if (threads.length === 0) {
    Logger.log("No se encontraron correos nuevos sin leer de nómina Banamex.");
    return;
  }

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(msg) {
      if (msg.isUnread()) {
        const bodyText = msg.getPlainBody();
        Logger.log("Procesando correo recibido: " + msg.getDate());

        const payload = JSON.stringify({
          text: bodyText,
          secret: CONFIG.SECRET
        });

        const options = {
          method: "post",
          contentType: "application/json",
          payload: payload,
          muteHttpExceptions: true
        };

        try {
          const response = UrlFetchApp.fetch(CONFIG.ENDPOINT, options);
          const responseCode = response.getResponseCode();
          const responseText = response.getContentText();
          Logger.log("Respuesta servidor (" + responseCode + "): " + responseText);

          if (responseCode === 200) {
            msg.markRead(); // Marca como leído para no procesar duplicados
            Logger.log("Correo procesado y marcado como leído exitosamente.");
          } else {
            Logger.warn("El servidor no aceptó el correo. Código: " + responseCode);
          }
        } catch (err) {
          Logger.error("Error al conectar con el webhook de Finanzas: " + err.toString());
        }
      }
    });
  });
}

/**
 * EJECUTAR ESTA FUNCIÓN UNA SOLA VEZ AL INICIO.
 * Configura el activador recurrente que se ejecuta cada Miércoles a las 6:00 PM (18:00 hrs).
 */
function configurarActivadorMiercoles() {
  // Limpiar activadores existentes de esta función para evitar duplicados
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "syncBanamexPayroll") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Crear activador para los Miércoles a las 18:00 hrs (6:00 PM)
  ScriptApp.newTrigger("syncBanamexPayroll")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.WEDNESDAY)
    .atHour(18)
    .nearMinute(5) // Inicia a las 6:05 PM garantizando que el depósito ya cayó
    .create();

  Logger.log("ACTIVADOR CREADO CON ÉXITO: syncBanamexPayroll se ejecutará automáticamente cada Miércoles a las 6:00 PM.");
}

