require "http/server"

# crystal build -Dpreview_mt --release clue_server.cr
# ./clue_server
#
# window 2a:
# curl "http://localhost:9292/"
#


def elapsed_text(elapsed)
  millis = elapsed.total_milliseconds
  return "#{millis.round(2)}ms" if millis >= 1

  "#{(millis * 1000).round(2)}µs"
end

def mime_type_for(ext)
  case ext
    when ".json"         then "application/json"
    when ".txt"          then "text/plain"
    when ".htm", ".html" then "text/html"
    when ".css"          then "text/css"
    when ".js"           then "application/javascript"
  else                      "application/octet-stream"
  end
end

def ext_for(path)
  File.extname(path)
end

def ext_and_mime_type_for(path)
  ext = ext_for(path)
  return [ext, mime_type_for(ext)]
end

Mime = "text/html"
ip   = ARGV[0]? ? ARGV[0] : "0.0.0.0"
port = ((ARGV[1]? ? ARGV[1] : "9292").to_i)

# There's a bug in the LogHandler that causes server to crash:
#
# server = HTTP::Server.new([HTTP::CompressHandler.new, HTTP::ErrorHandler.new, HTTP::LogHandler.new]) do |context|
#

server = HTTP::Server.new([HTTP::CompressHandler.new, HTTP::ErrorHandler.new]) do |context|
  st = Time.utc
  req = context.request
  res = context.response
  res.content_type = Mime
  if req.method == "GET"
    File.each_line("./public/index.html") do |line|
      res.output << line
    end
    res.flush
  end
  et = Time.utc
  puts("#{st} INFO - query_server: #{ip} - #{req.method} #{req.resource} #{req.version} - #{res.status_code} (#{elapsed_text(et - st)})")

  next
end

puts "Listening on http://#{ip}:#{port}"
server.listen(ip, port)
