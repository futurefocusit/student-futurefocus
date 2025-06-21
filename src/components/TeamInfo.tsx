"use client";
import { useSortable } from "@dnd-kit/sortable";
import {
  ArrowUpRightFromSquareIcon,
  GripVertical,
  PhoneIcon,
  X,
  PenBoxIcon,
  TrashIcon
} from "lucide-react";
import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import FormattedDate from "@/components/FormattedDate";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaSnapchat,
} from "react-icons/fa";

export const SortableMemberCard = ({
  member,
  handleEdit,
  handleDelete,
  handleMoreInfo,
  handleToggleAttend,
  handleToggleActive,
  handleToggleAdmin,
  togglesAdmin,
  togglesAttedance,
  togglesActive,
  moreInfo,
  setMoreInfo,
}) => {
  const [viewSupporting, setViewSupporting] = useState<string | null>(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: member._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const handleSupportDocument = (id: string) => {
    setViewSupporting((prev) => (prev === id ? null : id));
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col md:flex-row md:justify-between items-center p-3 md:p-4 border rounded-lg shadow-md bg-white"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <div
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-700 cursor-grab active:cursor-grabbing drag-handle"
          title="Drag to reorder"
          style={{ touchAction: "none" }}
        >
          <GripVertical size={20} className="md:size-20" />
        </div>
        <img
          src={member.image}
          alt={member.name}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
        />
        <div className="flex flex-col md:items-start items-center sm:text-left">
          <h3 className="text-lg md:text-xl font-bold mb-1">{member.name}</h3>
          <p className="text-gray-700 mb-1">{member.position}</p>
          <div
            onClick={() => handleMoreInfo(member._id)}
            className="flex items-center gap-2 mb-3 text-blue-700 cursor-pointer hover:text-green-700 hover:underline"
          >
            <p className="font-bold text-sm">More Info...</p>
            <ArrowUpRightFromSquareIcon size={13} />
          </div>
        </div>
      </div>

      {moreInfo === member._id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 py-0 md:py-5">
          <div className="bg-white p-3 md:p-5 w-full md:w-1/2 overflow-y-auto h-full rounded">
            <div className="flex flex-col gap-10">
              <div className="fixed top-0 left-0 right-0 z-50 bg-white flex justify-between items-center p-4 md:static">
                <h1 className="font-bold text-2xl text-blue-700">
                  Member Profile
                </h1>
                <X
                  onClick={() => setMoreInfo(null)}
                  size={25}
                  className="cursor-pointer hover:bg-red-700 rounded-full p-1 hover:text-white"
                />
              </div>

              <div className="flex md:mt-0 mt-16 md:flex-row flex-col items-start md:items-center gap-5">
                {/* Image */}
                <div className="shrink-0 w-36 h-36 rounded-full bg-black overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                  <div className="flex-1">
                    <h1 className="font-bold text-lg">{member.name}</h1>
                    <p className="font-medium text-gray-500">{member.email}</p>
                    <p className="font-medium text-gray-500">{member.phone}</p>
                    <p className="font-medium italic text-blue-700">
                      {member.position}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 items-start text-right min-w-[120px]">
                    <div className="flex gap-2 items-center">
                      <p className="text-sm font-bold">Contract Type:</p>
                      <p className=" text-gray-600">{member.contractType}</p>
                    </div>
                    <a
                      href={member.contract}
                      className="text-blue-700 italic text-sm hover:underline"
                    >
                      View Contract...
                    </a>
                    <div className="flex gap-2 items-start">
                      <p className="text-sm font-bold">ID:</p>
                      <p className=" text-gray-600">{member.nationalId}</p>
                    </div>

                    <div className="flex gap-2 items-start">
                      <p className="text-sm font-bold">Leave Status:</p>
                      <p className=" text-white font-semibold text-[12px]">
                        {member.leaveDetails.isOnLeave === false ? (
                          <p className="bg-green-600 p-1 min-w-full rounded">
                            Active
                          </p>
                        ) : (
                          <p className="bg-red-600 p-1 w-full rounded">
                            On Leave
                          </p>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                  <h1 className="font-bold text-2xl">About Me</h1>
                  <p>{member.bio}</p>

                  <p
                    onClick={() => handleSupportDocument(member._id)}
                    className="text-green-700 text-sm font-bold italic hover:underline cursor-pointer"
                  >
                    View Supporting Files{" "}
                  </p>
                </div>

                <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                  <h1 className="font-bold text-2xl">Job Information</h1>
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex flex-row gap-5">
                      <div className="flex flex-col gap-1 items-start text-sm font-semibold">
                        <p>Names</p>
                        <p>Job Position</p>
                        <p>Joined Date</p>
                        <p>Payment Date</p>
                        <p>Salary/ Wage</p>
                      </div>

                      <div className="flex flex-col gap-1 items-start text-sm">
                        <p>{member.name}</p>
                        <p>{member.position}</p>
                        <p>
                          <FormattedDate date={member.dateJoined} />
                        </p>
                        <p>
                          {member.paymentDate}
                          <span>
                            {(() => {
                              const day = parseInt(member.paymentDate);
                              if (day === 1 || day === 21 || day === 31)
                                return "st";
                              if (day === 2 || day === 22) return "nd";
                              if (day === 3 || day === 23) return "rd";
                              return "th";
                            })()}
                          </span>
                          <span className="text-blue-600 ml-2">
                            Every Month
                          </span>
                        </p>
                        <div className="flex flex-row gap-1">
                          <p>{Number(member.salary).toLocaleString()}</p>
                          <p>{member.currency}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-5">
                      <div className="flex flex-col gap-1 items-start text-sm font-semibold">
                        <p>Entry Time</p>
                        <p>Exit Time</p>
                        <p>Working Days</p>
                      </div>
                      <div className="flex flex-col gap-1 items-start text-sm">
                        <p>{member.entry}</p>
                        <p>{member.exit}</p>
                        <p className="grid grid-cols-3 gap-1">
                          {member.days.split(",").map((day, index, arr) => (
                            <span key={index}>
                              {day.trim()}
                              {index < arr.length - 1 ? "," : ""}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {viewSupporting === member._id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 py-0 md:py-5">
                    <div className="bg-white p-4 w-[90%] md:w-1/3 rounded shadow-lg">
                      {/* Header */}
                      <div className="flex justify-between items-center mb-4">
                        <h1 className="text-lg font-bold">Supporting Files</h1>
                        <X
                          onClick={() => setViewSupporting(null)}
                          size={25}
                          className="cursor-pointer hover:bg-red-700 rounded-full p-1 hover:text-white"
                        />
                      </div>

                      {/* Files Section */}
                      <div className="flex flex-col gap-4">
                        {/* CV */}
                        {member.cv && (
                          <div className="border border-gray-300 p-3 rounded">
                            <p className="font-medium mb-1">CV:</p>
                            <a
                              href={member.cv}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 italic hover:text-blue-500 underline text-sm"
                            >
                              View CV
                            </a>
                          </div>
                        )}

                        {/* Certificates */}
                        {Array.isArray(member.certificate) &&
                          member.certificate?.length > 0 && (
                            <div className="border border-gray-300 p-3 rounded">
                              <p className="font-medium mb-2">Certificates:</p>
                              <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                                {member.certificate.map(
                                  (cert: { url: string; name: string }, i) => (
                                    <li key={i}>
                                      <a
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="italic hover:text-blue-500 underline"
                                      >
                                        {cert.name}
                                      </a>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                  <h1 className="font-bold text-2xl">Skills</h1>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {member.skills?.map((skill, index) => (
                      <div key={index} className="">
                        <p className="font-medium">📍 {skill}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 min-w-full">
                  <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                    <h1 className="font-bold text-2xl">Phone Number</h1>
                    <p className="flex gap-2 items-center">
                      <span>
                        <PhoneIcon size={15} />
                      </span>
                      {member.phone}
                    </p>

                    {member.phone2 && (
                      <p className="flex gap-2 items-center">
                        <span>
                          <PhoneIcon size={15} />
                        </span>
                        {member.phone2}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col border border-gray-400 p-3 rounded gap-2">
                    <h1 className="font-bold text-2xl">Social Profile</h1>
                    <div className="flex gap-3">
                      {member.linkedIn === "" ? ""
                      : 
                      <a href={member.linkedIn} className="hover:text-blue-700">
                        <span>
                          <FaLinkedin />
                        </span>
                      </a>}
                      {member.instagram === "" ? ""
                      :
                      <a
                        href={member.instagram}
                        className="hover:text-blue-700"
                      >
                        <span>
                          <FaInstagram />
                        </span>
                      </a>
                      }
                      {member.facebook === "" ? "" 
                      
                      :
                       <a href={member.facebook} className="hover:text-blue-700">
                        <span>
                          <FaFacebook />
                        </span>
                      </a> 
                      }
                      {member.snapchat === "" ? "" 
                      :
                       <a href={member.snapchat} className="hover:text-blue-700">
                        <span>
                          <FaSnapchat />
                        </span>
                      </a> 
                      }
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  {member.leaveDetails.isOnLeave === true && (
                    <div className="flex flex-col border border-gray-400 p-3 rounded gap-1">
                      <p className="font-bold text-2xl ">
                        {member.leaveDetails.isOnLeave === true && (
                          <div>
                            <p>Leave Details</p>
                            <p className="font-semibold text-sm">
                              Leave Type:{" "}
                              <span className="text-blue-700 font-semibold text-sm">
                                {member.leaveDetails.leaveType}
                              </span>
                            </p>
                          </div>
                        )}
                      </p>
                      <div className="flex gap-2">
                        <p>
                          Starting From{" "}
                          <span className="font-bold">
                            <FormattedDate
                              date={member.leaveDetails.startDate}
                            />
                          </span>
                        </p>
                        <p>
                          To{" "}
                          <span className="font-bold">
                            <FormattedDate date={member.leaveDetails.endDate} />
                          </span>
                        </p>
                      </div>
                      <p>{member.leaveDetails.approvedBy}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col border border-gray-400 p-3 rounded gap-1">
                  <h1 className="font-bold text-2xl">Permissions</h1>
                  <div className="flex flex-col gap-4 w-full md:w-auto">
                    {[
                      {
                        label: "ATTENDANCE",
                        toggleState: togglesAttedance[member._id],
                        toggleHandler: () => handleToggleAttend(member._id),
                      },
                      {
                        label: "ACTIVE",
                        toggleState: togglesActive[member._id],
                        toggleHandler: () => handleToggleActive(member._id),
                      },
                      {
                        label: "ADMIN",
                        toggleState: togglesAdmin[member._id],
                        toggleHandler: () => handleToggleAdmin(member._id),
                      },
                    ].map((toggle) => (
                      <div
                        key={toggle.label}
                        className="flex items-center justify-between gap-4"
                      >
                        <p className="font-bold text-sm md:text-base">
                          {toggle.label}:
                        </p>
                        <div
                          onClick={toggle.toggleHandler}
                          className={`toggle-container w-12 md:w-16 h-6 md:h-8 rounded-full flex items-center p-1 cursor-pointer ${
                            toggle.toggleState ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`toggle-circle w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                              toggle.toggleState
                                ? "translate-x-6 md:translate-x-8"
                                : ""
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4 sm:ml-auto">
        <div className="flex flex-row md:flex-col justify-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleEdit(member)}
            className="flex-1 md:flex-none px-4 py-2 text-sm md:text-base bg-green-600 text-white rounded-md"
          >
            <PenBoxIcon />
          </button>
          <button
            onClick={() => handleDelete(member._id)}
            className="flex-1 md:flex-none px-4 py-2 text-sm md:text-base bg-red-600 text-white rounded-md"
          >
            <TrashIcon/>
          </button>
        </div>
      </div>
    </div>
  );
};
