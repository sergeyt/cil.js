using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
using Newtonsoft.Json;

[assembly: AssemblyTitle("codegen")]
[assembly: AssemblyDescription("")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("TsvBits")]
[assembly: AssemblyProduct("codegen")]
[assembly: AssemblyCopyright("Copyright © TsvBits 2013")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace codegen
{
	internal class Program
	{
		private static void Main(string[] args)
		{
			DumpOpCodes();
		}

		private static void DumpOpCodes()
		{
			using (var output = new StreamWriter(@"C:\tsv\pets\vmjs\src\runtime\opcodes.js"))
			using (var writer = new JsonTextWriter(output)
				{
					Formatting = Formatting.Indented
				})
			{
				var fields = typeof(OpCodes).GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.GetField);
				var opCodes = (from fi in fields
				               select new {fi.Name, OpCode = (OpCode) fi.GetValue(null)})
					.OrderBy(x => (uint) x.OpCode.Value)
					.ToArray();

				Action<string, object> prop = (name, value) =>
					{
						writer.WritePropertyName(name);
						writer.WriteValue(value);
					};

				Action<string, string> propEnum = (name, value) =>
					{
						writer.WritePropertyName(name);
						writer.WriteRawValue(value);
					};

				Action<OpCode> dump = opCode =>
					{
						writer.WriteStartObject();
						prop("name", opCode.Name);
						prop("size", opCode.Size);
						prop("value", opCode.Value);
						propEnum("operand", "OperandType." + opCode.OperandType);
						propEnum("flow", "FlowControl." + opCode.FlowControl);
						propEnum("type", "OpCodeType." + opCode.OpCodeType);
						propEnum("pop", "StackBehaviour." + opCode.StackBehaviourPop);
						propEnum("push", "StackBehaviour." + opCode.StackBehaviourPush);
						writer.WriteEndObject();
					};

				var shortOpCodes = opCodes.Where(x => x.OpCode.Size == 1).ToDictionary(x => (int) x.OpCode.Value, x => x.Name);
				var longOpCodes = opCodes.Where(x => x.OpCode.Size > 1).ToDictionary(x => x.OpCode.Value & 0xff, x => x.Name);

				writer.WriteRaw("// warning: this file was auto generated!\n");
				writer.WriteRaw("var OpCodes = ");
				writer.WriteStartObject();
				foreach (var f in opCodes)
				{
					writer.WritePropertyName(f.Name);
					dump(f.OpCode);
				}
				writer.WriteEndObject();
				writer.WriteRaw(";\n");

				writer.WriteRaw("var ShortOpCodes = ");
				writer.WriteStartArray();
				for (var i = 0; i <= 255; i++)
				{
					string name;
					if (shortOpCodes.TryGetValue(i, out name))
					{
						writer.WriteRawValue("OpCodes." + name);
					}
					else
					{
						writer.WriteNull();
					}
				}
				writer.WriteEndArray();
				writer.WriteRaw(";\n");

				var maxLongOpCode = longOpCodes.Keys.Max();
				writer.WriteRawValue("var LongOpCodes = ");
				writer.WriteStartArray();
				for (var i = 0; i <= maxLongOpCode; i++)
				{
					string name;
					if (longOpCodes.TryGetValue(i, out name))
					{
						writer.WriteRawValue("OpCodes." + name);
					}
					else
					{
						writer.WriteNull();
					}
				}
				writer.WriteEndArray();
				writer.WriteRaw(";\n");
			}
		}
	}
}

