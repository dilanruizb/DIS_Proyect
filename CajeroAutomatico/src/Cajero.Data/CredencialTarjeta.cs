using System;
using System.Collections.Generic;
using System.Text;

namespace Cajero.Data
{
    public class CredencialTarjeta
    {
        public string NumeroTarjeta { get; set; } = string.Empty;
        public byte[] SalPin { get; set; } = Array.Empty<byte>();
        public byte[] HashPin { get; set; } = Array.Empty<byte>();
    }
}
