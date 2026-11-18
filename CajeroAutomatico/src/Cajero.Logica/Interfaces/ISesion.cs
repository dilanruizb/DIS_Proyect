using Cajero.Logica.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Logica.Interfaces
{
    public interface ISesion
    {
        int IdSesion { get; set; }
        DateTime FechaHoraInicio { get; set; }
        DateTime? FechaHoraFin { get; set; }
        bool Autenticada { get; set; }
        int IntentosPIN { get; set; }
        EstadoSesion Estado { get; set; }

        int IdCliente { get; set; }
        string NumeroTarjeta { get; set; }
    }
}
