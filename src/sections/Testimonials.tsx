import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import avatar5 from "@/assets/avatar-5.jpeg";
import Image from "next/image";

const testimonials = [
  {
    text: "“This product has completely transformed how I used to draft my resumes and cv's”",
    name: "Subhankar Patra",
    title: "SWE @ UBS",
    avatarImg: avatar5,
  },
  {
    text: "“This product has completely transformed how I used to draft my resumes and cv's”",
    name: "Subhankar Patra",
    title: "SWE @ UBS",
    avatarImg: avatar5,
  },
  {
    text: "“This product has completely transformed how I used to draft my resumes and cv's”",
    name: "Subhankar Patra",
    title: "SWE @ UBS",
    avatarImg: avatar5,
  },
  {
    text: "“This product has completely transformed how I used to draft my resumes and cv's”",
    name: "Subhankar Patra",
    title: "SWE @ UBS",
    avatarImg: avatar5,
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <h2 className="text-5xl md:text-6xl text-center tracking-tighter font-medium">
          Beyond Expectations
        </h2>
        <p className="text-white/70 text-lg md:text-xl text-center mt-5 tracking-tight max-w-sm mx-auto">
          Our revolutionary Resumex AI have transformed the traditional way of
          making resume..
        </p>
        <div className="overflow-hidden mt-10 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
          <div className="flex gap-5 ">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="border border-white/15 p-6 md:p-10 rounded-xl bg-[linear-gradient(to_bottom_left,rgb(140,69,255,.3),black)] max-w-xs md:max-w-md flex-none"
              >
                <div className="text-lg md:text-2xl tracking-tight">
                  {testimonial.text}
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <div className="relative after:content-[''] after:absolute after:inset-0 after:bg-[rgb(140,69,244)] after:mix-blend-soft-light before:content-[''] before:absolute before:inset-0 before:border before:border-white/30 before:z-10 before:rounded-lg">
                    <Image
                      src={testimonial.avatarImg}
                      alt="avatar"
                      className="h-11 w-11 rounded-lg grayscale "
                    />
                  </div>
                  <div className="">
                    <div>{testimonial.name}</div>
                    <div className="text-white/50 text-sm">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
